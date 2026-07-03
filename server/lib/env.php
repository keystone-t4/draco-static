<?php
declare(strict_types=1);

/**
 * Minimal .env loader — no Composer dependency, since shared hosting
 * often has no SSH/CLI access to run `composer install`.
 */
function draco_load_env(string $path): array
{
    $result = [];
    if (!is_file($path) || !is_readable($path)) {
        return $result;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if (strlen($value) >= 2 && (
            ($value[0] === '"' && str_ends_with($value, '"')) ||
            ($value[0] === "'" && str_ends_with($value, "'"))
        )) {
            $value = substr($value, 1, -1);
        }
        $result[$key] = $value;
    }

    return $result;
}
