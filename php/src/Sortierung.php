<?php

declare(strict_types=1);

namespace Llb;

/** Shared alphabetical ordering: punctuation is ignored only at the start. */
final class Sortierung
{
    private const FALT = [
        'ß' => 'ss', 'æ' => 'ae', 'œ' => 'oe', 'ø' => 'o', 'ł' => 'l',
        'ð' => 'd', 'þ' => 't',
    ];

    public static function schluessel(string $name): string
    {
        $name = preg_replace('/^[^\p{L}\p{N}]+/u', '', $name) ?? $name;
        $name = mb_strtolower($name, 'UTF-8');
        $name = strtr($name, self::FALT);
        if (class_exists(\Normalizer::class)) {
            $name = \Normalizer::normalize($name, \Normalizer::FORM_D) ?: $name;
            $name = preg_replace('/\p{Mn}+/u', '', $name) ?? $name;
        } else {
            $name = strtr($name, [
                'á'=>'a','à'=>'a','â'=>'a','ã'=>'a','ä'=>'a','å'=>'a','ā'=>'a','ă'=>'a','ą'=>'a',
                'ç'=>'c','ć'=>'c','č'=>'c','ĉ'=>'c','ċ'=>'c','ď'=>'d','đ'=>'d',
                'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e','ē'=>'e','ĕ'=>'e','ė'=>'e','ę'=>'e','ě'=>'e',
                'ğ'=>'g','ĝ'=>'g','ġ'=>'g','ħ'=>'h',
                'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i','ī'=>'i','ĭ'=>'i','į'=>'i','ı'=>'i',
                'ĺ'=>'l','ļ'=>'l','ľ'=>'l',
                'ñ'=>'n','ń'=>'n','ņ'=>'n','ň'=>'n',
                'ó'=>'o','ò'=>'o','ô'=>'o','õ'=>'o','ö'=>'o','ō'=>'o','ŏ'=>'o','ő'=>'o',
                'ŕ'=>'r','ř'=>'r','ś'=>'s','š'=>'s','ş'=>'s','ș'=>'s',
                'ţ'=>'t','ť'=>'t','ț'=>'t',
                'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u','ū'=>'u','ŭ'=>'u','ů'=>'u','ű'=>'u','ų'=>'u',
                'ý'=>'y','ÿ'=>'y','ź'=>'z','ż'=>'z','ž'=>'z',
            ]);
        }
        return $name;
    }

    /** Natural comparison of normalized names, with full written name as tie-breaker. */
    public static function name(string $a, string $b): int
    {
        return strnatcmp(self::schluessel($a), self::schluessel($b)) ?: strcmp($a, $b);
    }
}
