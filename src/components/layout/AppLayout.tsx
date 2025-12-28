'use client';

import { ReactNode } from 'react';

import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <div className="container">{children}</div>
      </main>
    </div>
  );
}

