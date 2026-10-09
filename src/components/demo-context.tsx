'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { z } from 'zod';
const schema = z.object({ id: z.string(), name: z.string().min(1).max(60), type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'MORTGAGE', 'AUTO_LOAN', 'SOLAR_LOAN', 'PERSONAL_LOAN', 'OTHER_LOAN', 'MANUAL_ASSET']), balance: z.number().int().nonnegative().max(100000000000) });
export type DemoAccount = z.infer<typeof schema>;
const Context = createContext<{ accounts: DemoAccount[]; add: (a: DemoAccount) => void; reset: () => void }>({ accounts: [], add: () => {}, reset: () => {} });
export function DemoProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  useEffect(() => { try { const parsed = z.array(schema).safeParse(JSON.parse(sessionStorage.getItem('aureli-demo-accounts') ?? '[]')); if (parsed.success) setAccounts(parsed.data); } catch {} }, []);
  function save(next: DemoAccount[]) { setAccounts(next); try { sessionStorage.setItem('aureli-demo-accounts', JSON.stringify(next)); } catch {} }
  return <Context.Provider value={{ accounts, add: a => save([...accounts, schema.parse(a)]), reset: () => save([]) }}>{children}</Context.Provider>;
}
export const useDemo = () => useContext(Context);
