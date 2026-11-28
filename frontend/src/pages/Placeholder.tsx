import { EmptyState, PageHeader } from '../components/ui'

/** Phase 1 stand-in. Each real page replaces its usage in App.tsx. */
export function Placeholder({ title, phase }: { title: string; phase: number }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState title="Coming in a later phase">This screen is built in Phase {phase} (see frontend/PROGRESS.md).</EmptyState>
    </>
  )
}
