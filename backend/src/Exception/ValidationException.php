<?php

declare(strict_types=1);

namespace App\Exception;

/**
 * Wyjątek rzucany przy błędach walidacji danych.
 */
final class ValidationException extends \InvalidArgumentException
{
    /**
     * @var array<string, string[]>
     */
    private array $errors;

    /**
     * @param array<string, string[]> $errors
     */
    public function __construct(string $message, array $errors = [])
    {
        parent::__construct($message);
        $this->errors = $errors;
    }

    /**
     * @param array<string, string[]> $errors
     */
    public static function fromErrors(array $errors): self
    {
        $messages = [];
        foreach ($errors as $field => $fieldErrors) {
            $messages[] = sprintf('%s: %s', $field, implode(', ', $fieldErrors));
        }

        return new self(
            'Błędy walidacji: ' . implode('; ', $messages),
            $errors
        );
    }

    public static function forField(string $field, string $message): self
    {
        return new self(
            sprintf('Błąd walidacji pola "%s": %s', $field, $message),
            [$field => [$message]]
        );
    }

    public static function forInvalidTimeRange(): self
    {
        return new self(
            'Czas zakończenia musi być późniejszy niż czas rozpoczęcia.',
            ['endTime' => ['Czas zakończenia musi być późniejszy niż czas rozpoczęcia.']]
        );
    }

    /**
     * @return array<string, string[]>
     */
    public function getErrors(): array
    {
        return $this->errors;
    }
}
