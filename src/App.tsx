import { faker } from '@faker-js/faker'
import { Button, Table, Tag } from 'antd'
import { useState } from 'react'

import { createCustomer } from './services/customers'
import { CustomerTable } from './types/customers'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function App() {
  const [customers, setCustomers] = useState<CustomerTable[]>([])
  const columns = [
    {
      title: 'Customer Id',
      dataIndex: 'customerId'
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: function (text: string) {
        if (text === 'fail') {
          return <Tag color="red">{text}</Tag>
        } else if (text === 'success') {
          return <Tag color="green">{text}</Tag>
        } else {
          return <Tag>{text}</Tag>
        }
      }
    },
    {
      title: 'Remark',
      dataIndex: 'remark'
    }
  ]

  const createRandomUser = function (): CustomerTable {
    return {
      customerId: faker.string.uuid(),
      customerName: faker.internet.userName(),
      status: 'idle',
      remark: ''
    };
  }

  const handleUpload = () => {
    const fakeCustomer = faker.helpers.multiple(createRandomUser, {
      count: 1000,
    })
    setCustomers(fakeCustomer)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapCustomerTable = (responseData: any, customer: CustomerTable, status: string) => {
    return {
      ...customer, status, remark: responseData.message
    }
  }

  const handleSubmit = async () => {
    for (const customer of customers) {
      await delay(1000)
      createCustomer(customer)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((response: any) => {
          const responseData = response.data
          setCustomers(prev => (prev.map((customer: CustomerTable) => {
            return responseData.data.customerId === customer.customerId ? mapCustomerTable(responseData.data, customer, 'success') : customer
          })))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }).catch((error: any) => {
          const responseData = error.response.data
          setCustomers(prev => (prev.map((customer: CustomerTable) => {
            return responseData.data.customerId === customer.customerId ? mapCustomerTable(responseData.data, customer, 'fail') : customer
          })))
        })
    }
  }



  return (
    <>
      <Button onClick={handleUpload}>Fake Upload</Button>
      <Table
        columns={columns}
        dataSource={customers}
      />
      <Button onClick={handleSubmit} type='primary'>Submit</Button>
    </>
  )
}

export default App
