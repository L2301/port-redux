import React from 'react'
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom'
import { UseFormReturn, Validate } from 'react-hook-form'
import { Pier, AddPier } from '../../../background/services/pier-service'
import { send } from '../../client/ipc';
import { pierKey } from '../../query-keys';

interface ShipNameFieldProps {
    form: UseFormReturn<AddPier>;
    placeholder?: string;
    validator?: Validate<string, AddPier>;
}

export const ShipNameField: React.FC<ShipNameFieldProps> = ({ form, validator, placeholder = '~sampel-palnet' }) => {
    const { data: piers } = useQuery(pierKey(), () => send('get-piers'))
    const shipnamePattern = /^[a-z~-]*$/i;
    const errors = form.formState.errors;
    const shipnameContainsInvalidCharacters = errors.shipName?.type === 'pattern';

    function getMatchingPier(shipName: string): Pier | undefined {
        return piers.find(pier => pier.shipName?.trim().toLowerCase() === shipName.toLowerCase())
    }
    const shipNameValidator = (value: string) => !getMatchingPier(value)

    return (
        <>
            <input
                id="shipname"
                type="text"
                {...form.register('shipName', {
                    required: true,
                    pattern: shipnamePattern,
                    validate: validator ? validator : shipNameValidator,
                    maxLength: 28
                })}
                className="input flex w-full mt-2"
                placeholder={placeholder}
                aria-invalid={!!errors.shipName}
            />
            <span className={`inline-block h-8.5 mt-2 text-xs text-red-600 ${errors.shipName ? 'visible' : 'invisible'}`} role="alert">
                { errors.shipName?.type === 'required' && 'Ship name is required'}
                { errors.shipName?.type === 'maxLength' && 'Ship name must be 28 characters or less'}
                { (!errors.shipName || shipnameContainsInvalidCharacters) && 'Ship name must only contain alphanumeric, dash, underscore, or tilde characters' }
                { errors.shipName?.type === 'validate' &&
                    <span>
                        A ship with this name <Link to={`/pier/${getMatchingPier(form.getValues().shipName).slug}`}>is already docked</Link> in Port.
                    </span>
                }
            </span>
        </>
    )
}