<?php

declare(strict_types=1);

namespace Llb;

/**
 * The JSON contract between a server-rendered list and `web/filter-server.js`.
 *
 * A list writes the same model into its HTML as it uses for the no-JS form.
 * The definition holds what the list is (group order, labels, columns, sort
 * keys, paging); state, facets, total and pagination describe one response.
 * Nothing about order or wording is scraped from the markup any more.
 */
final class FilterModel
{
    /**
     * @param array{area:string,lang:string,groups:array,sort:array,columns:array,pagination:array} $definition
     * @param array{q:string,filters:array,sort:string,sortDir:string,pagination:array} $state
     */
    public static function response(
        array $definition,
        array $state,
        array $facets,
        int $total,
        array $pagination,
    ): array {
        return [
            'definition' => $definition,
            'state' => $state,
            'facets' => $facets,
            'total' => $total,
            'pagination' => $pagination,
        ];
    }

    /** Encode for an inline `<script type="application/json">`. */
    public static function json(array $model): string
    {
        return json_encode($model,
            JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
            | JSON_THROW_ON_ERROR);
    }
}
