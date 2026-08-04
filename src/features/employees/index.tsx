import { useEffect, useState } from 'react'
import z from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearch } from '@tanstack/react-router'
import { ArrowLeft, UserCog, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PersonalInfo } from './components/personal-info'
import { Position } from './components/position'
import { Schedule } from './components/schedule'
import { SidebarNav } from './components/sidebar-nav'
import employeeData from './data/data.json'
import { EmployeeSchema } from './data/schema'

const sidebarNavItems = [
  {
    title: 'Personal Info',
    value: 'personal-info',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Schedule',
    value: 'schedule',
    icon: <XIcon size={18} />,
  },
  {
    title: 'Position',
    value: 'position',
    icon: <XIcon size={18} />,
  },
]

const EmployeesPage = () => {
  // States
  const [currentTab, setCurrentTab] = useState('personal-info')
  const [isEdit, setIsEdit] = useState(false)
  const [values, setValues] = useState()

  // Search
  const search = useSearch({ strict: false })
  const action = search?.action
  const employeeId = search?.employeeId

  useEffect(() => {
    if (
      action === 'edit' &&
      employeeData.find((emp) => emp.id === employeeId)
    ) {
      setIsEdit(true)
      setValues(employeeData.find((emp) => emp.id === employeeId))
      // console.log(employeeData.find((emp) => emp.id === employeeId))
    }
  }, [action])

  /**
   *
   */
  const form = useForm<z.infer<typeof EmployeeSchema>>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      middlename: '',
      email: '',
      sex: {
        value: 'male',
        label: 'Male',
      },
      address: '',
      dob: '',
      organization_unit: {
        value: '',
        label: '',
      },
      position: {
        value: '',
        label: '',
      },
      punch_code: '',
      schedule: '',
      phonenumber: '',
    },
  })

  useEffect(() => {
    if (values) {
      form.reset({
        firstname: values.firstname,
        lastname: values.lastname,
        middlename: values.middlename,
        email: values.email,
        sex: values.sex,
        address: values.address,
        dob: values.dob,
        organization_unit: values.organization_unit,
        position: values.position,
        punch_code: values.punch_code,
        schedule: values.schedule,
        phonenumber: values.phonenumber,
      })
    }
  }, [values, isEdit, form])

  /**
   *
   */
  const vvalues = useWatch({
    control: form.control,
  })
  const onSubmit = (data: any) => {
    console.log('values from useWwatch', vvalues)
    console.log('values from data', data)
    return
    // console.log(data)
    // toast.info(values)
  }

  console.log(form.formState.errors)

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <Link to='/employees-list' className='flex items-center gap-1'>
            <ArrowLeft size={18} />
            <span className='text-sm'>Back to employees list</span>
          </Link>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {isEdit ? 'Edit Employee' : 'Add a new Employee'}
          </h1>

          {/* <p className='text-muted-foreground'>
            Manage your account settings and set e-mail preferences.
          </p> */}
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav
              items={sidebarNavItems}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            {currentTab === 'personal-info' && <PersonalInfo form={form} />}
            {currentTab === 'position' && <Position form={form} />}
            {currentTab === 'schedule' && <Schedule form={form} />}
            <Button
              type='button'
              form='employee-form'
              onClick={form.handleSubmit(onSubmit)}
              className='w-fit place-self-end'
            >
              Save changes
            </Button>
          </div>
        </div>
      </Main>
    </>
  )
}

export default EmployeesPage
