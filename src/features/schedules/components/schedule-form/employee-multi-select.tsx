import { type Control } from 'react-hook-form'
import { MultiSelect, type Option } from 'react-multi-select-component'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { employees } from '../../data/employees'

type EmployeeMultiSelectProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  disabled?: boolean
}

export function EmployeeMultiSelect({
  control,
  disabled,
}: EmployeeMultiSelectProps) {
  return (
    <FormField
      control={control}
      name='employees'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Employees</FormLabel>
          <MultiSelect
            options={employees}
            value={(field.value ?? []) as Option[]}
            onChange={field.onChange}
            labelledBy='Select employees'
            hasSelectAll
            overrideStrings={{ selectAll: 'Select all employees' }}
            disabled={disabled}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
