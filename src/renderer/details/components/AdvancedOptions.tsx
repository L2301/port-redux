import React from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { UseFormReturn } from 'react-hook-form'
import { AddPier } from '../../../background/services/pier-service'
import {ChevronDown} from '../../icons/ChevronDown'
import {PortField} from './PortField'

type AdvancedOptionsProps = {
  className?: string,
  form: UseFormReturn<AddPier>,
  children?: React.ReactNode
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ form }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative">
      <Collapsible.Root open={open} onOpenChange={setOpen} className="absolute">
        <Collapsible.Trigger className="button border-none focus:outline-none cursor-pointer text-gray-400 dark:text-gray-500">
          Advanced Options <ChevronDown className="ml-1 w-5 h-5" primary="fill-current" />
        </Collapsible.Trigger>
        <Collapsible.Content className="flex flex-col justify-start pt-5 pr-3 h-40 overflow-scroll">
          <label htmlFor="port">Ames Port</label>
          <PortField type="ames" form={form} placeholder="random (default)" />
          <label className="pt-2" htmlFor="port">HTTP Port</label>
          <PortField type="http" form={form} placeholder="80"/>
          <label className="pt-2" htmlFor="port">HTTPS Port</label>
          <PortField type="https" form={form} placeholder="443"/>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  )
}