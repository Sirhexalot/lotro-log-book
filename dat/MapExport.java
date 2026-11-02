import java.io.File;
import delta.games.lotro.dat.data.*;
import delta.games.lotro.dat.utils.DatIconsUtils;

/**
 * Holt Kartenbilder direkt aus den DAT-Archiven des Clients.
 *
 * Aufruf: java MapExport CLIENT_DIR LOCALE OUT_DIR DID [DID ...]
 *
 * Die DID ist der imageId-Wert aus maps.xml. Es wird nur gelesen.
 */
public class MapExport {

    public static void main(String[] args) throws Exception {
        if (args.length < 4) {
            throw new IllegalArgumentException("CLIENT_DIR LOCALE OUT_DIR DID [DID ...]");
        }
        File root = new File(args[0]);
        String locale = args[1];
        File out = new File(args[2]);
        if (!out.isDirectory() && !out.mkdirs()) {
            throw new IllegalStateException("cannot create " + out);
        }

        DatConfiguration cfg = new DatConfiguration();
        cfg.setRootPath(root);
        cfg.setLocale(locale);
        DataFacade facade = new DataFacade(cfg);
        int ok = 0, bad = 0;
        try {
            for (int i = 3; i < args.length; i++) {
                int did;
                try {
                    did = Integer.parseInt(args[i].trim());
                } catch (NumberFormatException e) {
                    System.out.println("SKIP " + args[i]);
                    continue;
                }
                File target = new File(out, did + ".png");
                boolean done;
                try {
                    done = DatIconsUtils.buildImageFile(facade, did, target);
                } catch (Exception e) {
                    System.out.println("FEHLER " + did + ": " + e);
                    bad++;
                    continue;
                }
                if (done && target.isFile() && target.length() > 0) {
                    System.out.println("OK " + did + " " + target.length() + " bytes");
                    ok++;
                } else {
                    System.out.println("LEER " + did);
                    bad++;
                }
            }
        } finally {
            facade.dispose();
        }
        System.out.println("fertig: " + ok + " Bilder, " + bad + " ohne Ergebnis");
    }
}
