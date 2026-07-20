import { type Control } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SelectDropdown } from '@/components/select-dropdown'
import { DAY_OPTIONS } from '../../data/data'
import { TimeRangeFields } from './time-range-fields'

type DailyFieldsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  disabled?: boolean
}

export function DailyFields({ control, disabled }: DailyFieldsProps) {
  return (
    <div className='space-y-4'>
      <FormField
        control={control}
        name='day'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Day</FormLabel>
            <SelectDropdown
              defaultValue={field.value}
              onValueChange={field.onChange}
              placeholder='Select a day'
              items={DAY_OPTIONS}
              disabled={disabled}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormItem>
        <FormLabel>Time ranges</FormLabel>
        <TimeRangeFields control={control} name='times' disabled={disabled} />
      </FormItem>
    </div>
  )
}
