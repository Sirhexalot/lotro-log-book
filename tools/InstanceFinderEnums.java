import java.io.File;
import delta.games.lotro.dat.data.*;
import delta.games.lotro.dat.data.enums.EnumMapper;
import delta.games.lotro.dat.data.strings.*;

/** Read finder labels directly from installed DAT archives, not lore XML labels.
 * Run with Java source-file mode and the existing DAT decoder JAR classpath.
 * Arguments: CLIENT_DIR. TSV on stdout: enum, code, language, label.
 */
public class InstanceFinderEnums {
    public static void main(String[] args) throws Exception {
        if (args.length != 1) throw new IllegalArgumentException("CLIENT_DIR required");
        DatConfiguration config = new DatConfiguration();
        config.setRootPath(new File(args[0]));
        config.setLocale("de");
        DataFacade facade = new DataFacade(config);
        // Enum identities from the decoder/lore metadata; labels read afresh.
        String[] names = {"WJEncounterCategory", "WJEncounterType", "WJInstanceGroup"};
        int[] ids = {587203408, 587203337, 587203537};
        try {
            for (int i = 0; i < ids.length; i++) {
                EnumMapper mapper = facade.getEnumsManager().getEnumMapper(ids[i]);
                if (mapper == null) throw new IllegalStateException("Missing " + names[i]);
                for (int code : mapper.getKeys()) {
                    for (String lang : new String[]{"de", "en", "fr"}) {
                        StringsManager strings = facade.getGlobalStringsManager().getStringsManager(lang);
                        StringInfo info = mapper.getStringInfo(code);
                        String label = info == null ? mapper.getLabel(code)
                            : StringInfoUtils.renderStringInfo(strings, info);
                        if (label == null) throw new IllegalStateException("Missing label " + names[i] + ":" + code + ":" + lang);
                        System.out.println(names[i] + "\t" + code + "\t" + lang + "\t"
                            + label.replace("\t", " ").replace("\n", " ").replace("\r", " "));
                    }
                }
            }
        } finally {
            facade.dispose();
        }
    }
}
