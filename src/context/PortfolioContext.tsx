import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, apiFetch } from '../services/api';
import type { PortfolioBootstrapData, SystemConfigStatus } from '../types/portfolio';

interface PortfolioContextValue {
  data: PortfolioBootstrapData | null;
  loading: boolean;
  error: string | null;
  dbUnconfigured: boolean;
  configStatus: SystemConfigStatus | null;
  refresh: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

export function PortfolioProvider({
  children,
  overrideData,
}: {
  children: ReactNode;
  overrideData?: PortfolioBootstrapData | null;
}) {
  const [data, setData] = useState<PortfolioBootstrapData | null>(overrideData || null);
  const [loading, setLoading] = useState<boolean>(!overrideData);
  const [error, setError] = useState<string | null>(null);
  const [dbUnconfigured, setDbUnconfigured] = useState(false);
  const [configStatus, setConfigStatus] = useState<SystemConfigStatus | null>(null);

  const load = useCallback(async () => {
    if (overrideData) {
      setData(overrideData);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<PortfolioBootstrapData>('/api/public/bootstrap');
      setData(payload);
      setDbUnconfigured(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503 && err.code === 'DATABASE_NOT_CONFIGURED') {
        setDbUnconfigured(true);
        setConfigStatus((err.data?.configStatus as SystemConfigStatus) || null);
        setError('Database configuration is required to load live portfolio data.');
      } else {
        setError(err instanceof Error ? err.message : 'Unable to load portfolio content.');
      }
    } finally {
      setLoading(false);
    }
  }, [overrideData]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PortfolioContext.Provider
      value={{
        data: overrideData || data,
        loading,
        error,
        dbUnconfigured,
        configStatus,
        refresh: load,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
