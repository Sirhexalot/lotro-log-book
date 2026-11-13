import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;
import javax.imageio.ImageIO;
import delta.games.lotro.dat.data.*;
import delta.games.lotro.gui.maps.DatRadarImageProvider;

/** Read-only, resumable radar export via the installed Companion library. */
public class ExportTerrain {
    public static void main(String[] args) throws Exception {
        if (args.length != 3) throw new IllegalArgumentException("CLIENT OUTPUT REQUESTS_TSV");
        File out = new File(args[1]);
        if (!out.isDirectory() && !out.mkdirs()) throw new IOException("Cannot create " + out);
        File manifest = new File(out, "tiles.jsonl");
        Set<String> done = new HashSet<>();
        if (manifest.isFile()) {
            for (String line : Files.readAllLines(manifest.toPath(), StandardCharsets.UTF_8)) {
                String[] fields = line.split("\"", 5);
                if (fields.length >= 4 && fields[1].equals("key")) done.add(fields[3]);
            }
        }
        DatConfiguration cfg = new DatConfiguration();
        cfg.setRootPath(new File(args[0])); cfg.setLocale("de");
        DataFacade facade = new DataFacade(cfg);
        int ok = 0, missing = 0, skipped = 0, processed = 0;
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(new FileOutputStream(manifest, true), StandardCharsets.UTF_8))) {
            DatRadarImageProvider provider = new DatRadarImageProvider(facade);
            for (String row : Files.readAllLines(new File(args[2]).toPath(), StandardCharsets.UTF_8)) {
                if (row.trim().isEmpty()) continue;
                String[] fields = row.split("\t");
                int region = Integer.parseInt(fields[0]), bx = Integer.parseInt(fields[1]), by = Integer.parseInt(fields[2]);
                if (region < 1 || region > 255 || bx < 0 || bx > 255 || by < 0 || by > 255) throw new IllegalArgumentException(row);
                String key = region + "/" + bx + "/" + by;
                if (done.contains(key)) { skipped++; continue; }
                BufferedImage image = provider.getImage(region, bx, by);
                String base = "{\"key\":\"" + key + "\",\"region\":" + region + ",\"x\":" + bx + ",\"y\":" + by;
                if (image == null) {
                    writer.println(base + ",\"available\":false}"); missing++;
                } else {
                    File directory = new File(out, "r" + region);
                    if (!directory.isDirectory() && !directory.mkdirs()) throw new IOException("Cannot create " + directory);
                    File file = new File(directory, by + "_" + bx + ".png");
                    File temporary = new File(directory, by + "_" + bx + ".png.part");
                    if (!ImageIO.write(image, "png", temporary)) throw new IOException("Missing PNG writer");
                    Files.move(temporary.toPath(), file.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    writer.println(base + ",\"available\":true,\"width\":" + image.getWidth() + ",\"height\":" + image.getHeight() + "}"); ok++;
                }
                processed++;
                if (processed % 1000 == 0) {
                    writer.flush();
                    System.out.println("Processed " + processed + ": " + ok + " images, " + missing + " absent; reused " + skipped);
                }
            }
            writer.flush();
            if (writer.checkError()) throw new IOException("Could not write manifest");
        } finally { facade.dispose(); }
        System.out.println("Finished: " + ok + " images, " + missing + " absent, " + skipped + " reused");
    }
}
