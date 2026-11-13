<?php

declare(strict_types=1);

namespace Llb;

/**
 * Which language a visitor gets when the address names none.
 *
 * Order: an explicit choice (the functional cookie set by the language
 * switcher) wins, then the browser's accepted languages in their own priority
 * order, then English. Only German and French are recognised; every other
 * language — including English — falls back to English.
 *
 * A language in the path (`/de/…`, `/en/…`, `/fr/…`) always wins and never
 * reaches this class: shared links keep the language they were shared in.
 */
final class Sprache
{
    public const ERLAUBT = ['de', 'en', 'fr'];
    public const COOKIE = 'llb_sprache';
    public const VORGABE = 'en';

    /** The visitor's language from cookie and Accept-Language header. */
    public static function ausRequest(array $cookies, string $acceptLanguage): string
    {
        $gewaehlt = strtolower(trim((string) ($cookies[self::COOKIE] ?? '')));
        if (in_array($gewaehlt, self::ERLAUBT, true)) {
            return $gewaehlt;
        }
        return self::ausAcceptLanguage($acceptLanguage);
    }

    /** First accepted language we serve, in the browser's own priority order. */
    public static function ausAcceptLanguage(string $header): string
    {
        $eintraege = [];
        foreach (explode(',', $header) as $stelle => $roh) {
            $teile = explode(';', trim($roh));
            $tag = strtolower(trim($teile[0]));
            if ($tag === '') {
                continue;
            }
            $guete = 1.0;
            foreach (array_slice($teile, 1) as $parameter) {
                if (preg_match('~^\s*q\s*=\s*([0-9.]+)\s*$~i', $parameter, $m)) {
                    $guete = (float) $m[1];
                }
            }
            if ($guete <= 0.0) {
                continue;
            }
            // "de-AT" and "de_AT" both count as German; the region is irrelevant.
            $primaer = preg_split('~[-_]~', $tag)[0];
            $eintraege[] = ['tag' => $primaer, 'q' => $guete, 'stelle' => $stelle];
        }
        usort($eintraege, static fn (array $a, array $b): int =>
            [$b['q'], $a['stelle']] <=> [$a['q'], $b['stelle']]);
        foreach ($eintraege as $eintrag) {
            if ($eintrag['tag'] === 'de') {
                return 'de';
            }
            if ($eintrag['tag'] === 'fr') {
                return 'fr';
            }
        }
        return self::VORGABE;
    }
}
