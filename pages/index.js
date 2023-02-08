import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, { useState, useEffect } from 'react'

import { read, utils, writeFile } from 'xlsx'

export default function Home() {
  const [name, setName] = useState('')
  const [report, setReport] = useState({
    companyName: '',
    title: '',
    period: '',
  })
  const [entryArray, setEntryArray] = useState([]) // array of entries
  const [selectedFile, setSelectedFile] = useState(null)

  // read the uploaded file into entryArray using xlsx library without headers
  const readFile = () => {
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(selectedFile)
    fileReader.onload = (e) => {
      const bufferArray = e.target.result
      const wb = read(bufferArray, { type: 'buffer' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data = utils.sheet_to_json(ws, { header: 1 })
      setEntryArray(data)
      console.log(data)
    }
  }

  // convert entryArray arrays of array index of 3 and 23 to date
  const convertEntryArray = () => {
    const newArray = entryArray.map((entry) => {
      const newEntry = [...entry]
      newEntry[3] = convertDate(entry[3])
      newEntry[23] = convertDate(entry[23])
      return newEntry
    })
    setEntryArray(newArray)
  }

  // read entryArray index of 0. the item of index 0 will be the company name, index 1 will be the title, index 2 will be the period
  const readReport = () => {
    const newReport = {
      companyName: entryArray[0][0],
      title: entryArray[0][1],
      period: entryArray[0][5],
    }
    setReport(newReport)
  }

  // loop entryArray and group by every entry at index 18 (employee name)
  const groupByEmployee = () => {
    const grouped = entryArray.reduce((acc, cur) => {
      const key = cur[18]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(cur)
      return acc
    }, {})
    return grouped
  }

  // read the file when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      readFile()
      convertEntryArray()
      readReport()
      console.log(groupByEmployee())
    }
  }, [selectedFile])

  // xlsx read date as number, convert to date without time
  const convertDate = (date) => {
    const newDate = new Date(Math.round((date - 25569) * 86400 * 1000))
    return newDate.toISOString().split('T')[0]
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to{' '}
          <a href='https://nextjs.org'>
            InfoTech Attendance Problem Beautifier!
          </a>
        </h1>
        <p className={styles.description}>
          Get started by uploading{' '}
          <code className={styles.code}>Attendance Problem Report.csv</code>
        </p>
        <input
          type='file'
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <div>
          <h1>{report.companyName}</h1>
          <h2>{report.title}</h2>
          <h3>{report.period}</h3>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href='https://next.new' target='_blank' rel='noopener noreferrer'>
          Created with&nbsp;<b>next.new</b>&nbsp;⚡️ by Thomas Tan 2023
        </a>
      </footer>
    </div>
  )
}
