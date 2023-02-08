import Head from 'next/head';
import styles from '../styles/Home.module.css';
import React, { useState, useEffect } from 'react';

import { read, utils, writeFile } from 'xlsx';


export default function Home() {
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const readFile = async () => {
    const f = await selectedFile.arrayBuffer();
    const workbook = read(f);
    const data = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    console.log(data);
  };

  useEffect(() => {
    readFile();
  }, [selectedFile]);
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to{' '}
          <a href="https://nextjs.org">
            InfoTech Attendance Problem Beautifier!
          </a>
        </h1>

        <p className={styles.description}>
          Get started by uploading{' '}
          <code className={styles.code}>Attendance Problem Report.csv</code>
        </p>

        <div>
          <input
            type="file"
            id="file"
            name="file"
            accept=".csv"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://next.new" target="_blank" rel="noopener noreferrer">
          Created with&nbsp;<b>next.new</b>&nbsp;⚡️ by Thomas Tan 2023
        </a>
      </footer>
    </div>
  );
}
