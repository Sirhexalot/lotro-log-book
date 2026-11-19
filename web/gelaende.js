/* Client-derived radar terrain. No external map service or foreign annotations. */
(function () {
	'use strict';
	var KEY = 'mql.kartenansicht';
	var VORK_KEY = 'mql.vorkommen';
	var MIGRATION_KEY = 'mql.karten-voreinstellungen-migration';
	var MIGRATION_VERSION = '2026-11-19';
	var WORDS = {
		de: ['Gelände', 'Spielkarte', 'Kartenansicht', 'Vergrößern', 'Verkleinern', 'Gebiet einpassen', 'Für diese Karte ist keine Geländeansicht verfügbar.', 'Gelände konnte nicht geladen werden. Die Spielkarte wird angezeigt.'],
		en: ['Terrain', 'Game map', 'Map view', 'Zoom in', 'Zoom out', 'Fit area', 'Terrain is not available for this map.', 'Terrain could not be loaded. Showing the game map.'],
		fr: ['Terrain', 'Carte du jeu', 'Vue de la carte', 'Zoom avant', 'Zoom arrière', 'Afficher la zone', 'Le terrain n’est pas disponible pour cette carte.', 'Impossible de charger le terrain. La carte du jeu est affichée.']
	};
	var preferenceListeners = [];
	function preference(storage) {
		try { return storage && storage.getItem(KEY) === 'gelaende' ? 'gelaende' : 'karte'; }
		catch (_) { return 'karte'; }
	}
	function notifyPreference(mode) {
		preferenceListeners.slice().forEach(function (listener) { listener(mode); });
	}
	function setPreference(mode) {
		if (mode !== 'gelaende' && mode !== 'karte') { return; }
		try { window.localStorage.setItem(KEY, mode); } catch (_) {}
		notifyPreference(mode);
	}
	function subscribePreference(listener) {
		preferenceListeners.push(listener);
		listener(preference(migrationStorage));
		return function () {
			var index = preferenceListeners.indexOf(listener);
			if (index >= 0) { preferenceListeners.splice(index, 1); }
		};
	}
	function migratePreferences(storage) {
		if (!storage) { return false; }
		try {
			if (storage.getItem(MIGRATION_KEY) === MIGRATION_VERSION) { return false; }
			storage.setItem(KEY, 'karte');
			storage.setItem(VORK_KEY, JSON.stringify({ wahl: {} }));
			storage.setItem(MIGRATION_KEY, MIGRATION_VERSION);
			return true;
		} catch (_) {
			return false;
		}
	}
	var migrationStorage;
	try { migrationStorage = window.localStorage; } catch (_) { migrationStorage = null; }
	migratePreferences(migrationStorage);
	function frameMatches(map, entry) {
		return !!(map && entry && map.mr === entry.region && Array.isArray(entry.frame) && entry.frame.length === 4 && entry.frame.every(Number.isFinite)
			&& entry.frame[2] > entry.frame[0] && entry.frame[1] > entry.frame[3]
			&& (entry.overview || ['west', 'north', 'east', 'south'].every(function (key, i) { return Math.abs(map[key] - entry.frame[i]) < .0001; })));
	}
	window.MQL_GELAENDE = {
		preference: preference,
		setPreference: setPreference,
		subscribePreference: subscribePreference,
		words: function (language) { return WORDS[language] || WORDS.en; },
		migratePreferences: migratePreferences,
		frameMatches: frameMatches,
		create: function (options) {
			var world = options.world, stage = options.stage, image = options.image;
			var controls = document.getElementById('kartenansicht');
			if (!controls) { return null; }
			var words = WORDS[options.language] || WORDS.en;
			var terrainButton = controls.querySelector('[data-kartenansicht="gelaende"]');
			var gameButton = controls.querySelector('[data-kartenansicht="karte"]');
			var zoomControls = document.getElementById('gelaende-zoom');
			var plus = zoomControls.querySelector('[data-zoom="in"]'), minus = zoomControls.querySelector('[data-zoom="out"]'), fit = zoomControls.querySelector('[data-zoom="fit"]');
			terrainButton.textContent = words[0]; gameButton.textContent = words[1]; controls.setAttribute('aria-label', words[2]);
			plus.setAttribute('aria-label', words[3]); minus.setAttribute('aria-label', words[4]); fit.setAttribute('aria-label', words[5]); fit.title = words[5];
			var status = document.getElementById('gelaende-status');
			var storage; try { storage = window.localStorage; } catch (_) { storage = null; }
			var wanted = preference(storage), current = null, manifest = null, active = false, failed = false, settled = false;
			var scale = 1, tx = 0, ty = 0, dragging = null, moved = false, suppressClick = false;
			var pending = 0, tiles = new Map(), kachelMerk = {};
			var layer = document.createElement('div'); layer.className = 'gelaende-kacheln'; layer.hidden = true; layer.setAttribute('aria-hidden', 'true');
			world.insertBefore(layer, image);
			// Manifest schema 2 stores a map as [region, west, north, east, south,
			// overview, thumbnail] and the tiles as horizontal runs. Schema 1 with
			// objects and single names is still read, so a cached older file works.
			function kurz(eintrag) {
				if (!eintrag) { return null; }
				if (Array.isArray(eintrag)) {
					return { region: eintrag[0], frame: [eintrag[1], eintrag[2], eintrag[3], eintrag[4]],
						overview: !!eintrag[5], thumb: !!eintrag[6] };
				}
				return { region: eintrag.region, frame: eintrag.frame, overview: !!eintrag.overview,
					thumb: !!eintrag.thumbnail };
			}
			function entry() { return kurz(manifest && current && manifest.maps[String(current.idx)]); }
			function usable() { return !!(current && frameMatches(current, entry()) && !failed); }
			function kacheln(region, level) {
				var schluessel = region + '/' + level;
				if (kachelMerk[schluessel]) { return kachelMerk[schluessel]; }
				var liste = (manifest.regions[region] || {})[level] || [];
				var satz = new Set();
				liste.forEach(function (eintrag) {
					if (typeof eintrag === 'string') { satz.add(eintrag); return; }
					for (var x = eintrag[1]; x <= eintrag[2]; x += 1) { satz.add(eintrag[0] + '_' + x); }
				});
				kachelMerk[schluessel] = satz;
				return satz;
			}
			function effectiveFrame() {
				var e = entry();
				return active && e ? { west:e.frame[0], north:e.frame[1], east:e.frame[2], south:e.frame[3] } : current;
			}
			function maximum() {
				if (!active) { return current ? 4 : 1; }
				var f = effectiveFrame();
				return f ? Math.max(1, Math.min(4, (f.east-f.west)*250 / (world.clientWidth || 720))) : 1;
			}
			function clear() { tiles.forEach(function (node) { node.onerror=null;node.remove(); }); tiles.clear(); }
			function schedule() { if (!pending) { pending = requestAnimationFrame(function () { pending = 0; draw(); }); } }
			function view() {
				if (!current) { return; }
				scale = Math.max(1, Math.min(maximum(), scale));
				var mx = world.clientWidth*(scale-1)/2, my = world.clientHeight*(scale-1)/2;
				tx = Math.max(-mx,Math.min(mx,tx)); ty = Math.max(-my,Math.min(my,ty));
				world.style.setProperty('--gelaende-invers', String(1/scale));
				world.style.transformOrigin = 'center'; world.style.transform = 'translate('+tx+'px,'+ty+'px) scale('+scale+')';
				plus.disabled = scale >= maximum()-.001; minus.disabled = scale <= 1.001; fit.disabled = scale <= 1.001;
				zoomControls.dataset.scale = String(scale);
				if (active) { schedule(); }
				if (options.onView) { options.onView(); }
			}
			function apply() {
				active = wanted === 'gelaende' && usable();
				world.dataset.kartenansicht=active?'gelaende':'karte';
				layer.hidden = !active;
				world.classList.toggle('gelaende-aktiv', active);
				world.classList.toggle('karten-zoom-aktiv', !!current && !active);
				stage.classList.toggle('gelaende-aktiv', active);
				terrainButton.disabled = !usable(); terrainButton.title = usable() ? '' : words[6];
				terrainButton.setAttribute('aria-pressed', String(active)); gameButton.setAttribute('aria-pressed', String(!active));
				controls.hidden = !manifest || !current;
				// Reserve the same toolbar space in both views; never cover the image.
				zoomControls.hidden = !current; zoomControls.classList.toggle('inaktiv', !current);
				plus.disabled = !current || scale >= maximum()-.001; minus.disabled = !current || scale <= 1.001; fit.disabled = !current || scale <= 1.001;
				status.textContent = failed ? words[7] : '';
				if (!active) { clear(); }
				if (options.onChange) { options.onChange(); }
				if (current) {
					stage.classList.toggle('gelaende-aktiv', active);
					stage.classList.toggle('karten-zoom-aktiv', !active);
					if (active) { stage.classList.remove('keinbild'); }
					view();
				} else {
					world.style.transform = 'none';
					stage.classList.remove('karten-zoom-aktiv');
				}
			}
			function select(mode) {
				if (wanted === mode) { return; }
				scale=1;tx=0;ty=0; setPreference(mode);
			}
			terrainButton.addEventListener('click',function(){select('gelaende');});
			gameButton.addEventListener('click',function(){select('karte');});
			function zoom(factor, x, y) {
				if (!current) { return; }
				var next=Math.max(1,Math.min(maximum(),scale*factor)), ratio=next/scale;
				tx=tx*ratio+(x||0)*(1-ratio);ty=ty*ratio+(y||0)*(1-ratio);scale=next;view();
			}
			plus.addEventListener('click',function(){zoom(1.4);}); minus.addEventListener('click',function(){zoom(1/1.4);});
			fit.addEventListener('click',function(){scale=1;tx=0;ty=0;view();});
			stage.addEventListener('wheel',function(e){
				if(!current){return;}e.preventDefault();var r=world.getBoundingClientRect();
				zoom(e.deltaY<0?1.15:1/1.15,e.clientX-r.left-r.width/2+tx,e.clientY-r.top-r.height/2+ty);
			},{passive:false});
			stage.addEventListener('pointerdown',function(e){
				if(!current||e.button!==0||e.target.closest('button,a,.punkt,.schritt,.jagdpunkt,.hinweispunkt,.notiz')){return;}
				dragging={id:e.pointerId,x:e.clientX,y:e.clientY,tx:tx,ty:ty};moved=false;
			});
			stage.addEventListener('pointermove',function(e){if(!dragging||dragging.id!==e.pointerId){return;}var dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.abs(dx)+Math.abs(dy)>4){moved=true;if(!stage.hasPointerCapture(e.pointerId)){stage.setPointerCapture(e.pointerId);}}if(!moved){return;}tx=dragging.tx+dx;ty=dragging.ty+dy;view();});
			stage.addEventListener('pointerup',function(e){if(dragging&&dragging.id===e.pointerId){suppressClick=moved;dragging=null;}});
			window.addEventListener('pointerup',function(e){if(dragging&&dragging.id===e.pointerId){dragging=null;}});
			stage.addEventListener('click',function(e){if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
			['pointercancel','lostpointercapture'].forEach(function(name){stage.addEventListener(name,function(){dragging=null;});});
			var unsubscribePreference = subscribePreference(function (mode) {
				if (wanted === mode) { return; }
				wanted = mode; scale=1;tx=0;ty=0;apply();
			});
			window.addEventListener('storage',function(e){if(e.key===KEY){notifyPreference(preference(storage));}});
			function draw() {
				if(!active||!manifest||!current){return;}
				var f=effectiveFrame(), spanX=f.east-f.west,spanY=f.north-f.south;
				var pixels=world.clientWidth*scale*(window.devicePixelRatio||1)/(spanX/.8),level=Math.max(0,Math.min(8,Math.floor(Math.log2(200/Math.max(1,pixels)))));
				var factor=Math.pow(2,level),size=.8*factor,region=current.mr;
				var present=kacheln(region,level);if(!present){failed=true;apply();return;}
				var wr=world.getBoundingClientRect(),sr=stage.getBoundingClientRect();
				var nx0=Math.max(0,(sr.left-wr.left)/wr.width),nx1=Math.min(1,(sr.right-wr.left)/wr.width);
				var ny0=Math.max(0,(sr.top-wr.top)/wr.height),ny1=Math.min(1,(sr.bottom-wr.top)/wr.height);
				var x0=Math.max(0,Math.floor((f.west+nx0*spanX+146.8)/size)-1),x1=Math.min(256/factor,Math.ceil((f.west+nx1*spanX+146.8)/size)+1);
				var y0=Math.max(0,Math.floor((f.north-ny1*spanY+124.4)/size)-1),y1=Math.min(256/factor,Math.ceil((f.north-ny0*spanY+124.4)/size)+1);
				var needed=new Set();
				for(var y=y0;y<y1;y++){for(var x=x0;x<x1;x++){
					var name=y+'_'+x;if(!present.has(name)){continue;}var key=region+'/'+level+'/'+name;needed.add(key);
					if(tiles.has(key)){continue;}var node=document.createElement('img');node.alt='';node.draggable=false;node.decoding='async';
					node.style.left=((-146.8+x*size-f.west)/spanX*100)+'%';node.style.top=((f.north-(-124.4+(y+1)*size))/spanY*100)+'%';
					node.style.width=(size/spanX*100+.015)+'%';node.style.height=(size/spanY*100+.015)+'%';
					node.onerror=function(){if(active){failed=true;apply();}};
					node.src='/gelaende/'+manifest.version+'/r'+region+'/'+level+'/'+name+'.webp';tiles.set(key,node);layer.appendChild(node);
				}}
				tiles.forEach(function(node,key){if(!needed.has(key)){node.onerror=null;node.remove();tiles.delete(key);}});
			}
			var ready = fetch('/gelaende/manifest.json').then(function(r){if(!r.ok){throw new Error('Terrain manifest unavailable');}return r.json();}).then(function(data){
				if((data.schema!==1&&data.schema!==2)||!data.maps||!data.regions||!/^[a-f0-9]+$/.test(data.version)){throw new Error('Invalid terrain manifest');}
				manifest=data;settled=true;apply();
			}).catch(function(){settled=true;controls.hidden=true;zoomControls.hidden=true;});
			return {
				ready:ready,
				hasResources:function(id){return !settled?undefined:manifest&&Array.isArray(manifest.resourceMaps)?manifest.resourceMaps.indexOf(String(id))>=0:null;},
				setMap:function(map){clear();current=map;world.dataset.karte=String(map.idx);failed=false;scale=1;tx=0;ty=0;apply();},
				active:function(){return active;},
				scale:function(){return current?scale:1;},
				layout:function(){if(current){view();}},
				thumbnail:function(map){var e=kurz(manifest&&map&&manifest.maps[String(map.idx)]);return wanted==='gelaende'&&e&&e.thumb?'/gelaende/'+manifest.version+'/thumb/'+map.idx+'.webp':null;},
				frame:function(map){if(active&&current&&map&&map.idx===current.idx){return Object.assign({},map,effectiveFrame(),{rahmen:'gelaende',eigen:entry().overview?false:map.eigen});}return map;},
				clear:function(){current=null;failed=false;delete world.dataset.karte;apply();}
			};
		}
	};
})();
