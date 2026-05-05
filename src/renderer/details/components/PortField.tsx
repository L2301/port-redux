import React from 'react'
import { UseFormReturn, Validate } from 'react-hook-form'
import { AddPier } from '../../../background/services/pier-service'

export type PortType = 'ames' | 'http' | 'https'

interface ShipNameFieldProps {
    type: PortType
    form: UseFormReturn<AddPier>;
    placeholder?: string;
    validator?: Validate<unknown, AddPier>;
}

export const PortField: React.FC<ShipNameFieldProps> = ({ type, form, validator, placeholder = 'default' }) => {
    const FIELD_ID = `${type}Port` as 'amesPort' | 'httpPort' | 'httpsPort'
    const errors = form.formState.errors

    return (
        <>
            <input
                id={FIELD_ID}
                type="number"
                {...form.register(FIELD_ID, {
                    validate: validator,
                    min: 1024,
                    max: 65535
                })}
                className="input flex w-full"
                placeholder={placeholder}
                aria-invalid={!!errors[FIELD_ID]}
            />
            <span className={`inline-block h-8.5 mt-2 text-xs text-red-600 ${errors[FIELD_ID] ? 'visible' : 'invisible'}`} role="alert">
              Invalid port. Must be a number between 1024-65535
            </span>
        </>
    )
}