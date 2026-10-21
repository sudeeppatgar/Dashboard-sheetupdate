import PageShell from '../../../shared/components/PageShell'
import NameResourceSection, { type NameResourceSectionProps } from './NameResourceSection'

type ProcessorsPageProps = {
  resource: NameResourceSectionProps
}

function ProcessorsPage({ resource }: ProcessorsPageProps) {
  return (
    <PageShell>
      <NameResourceSection {...resource} />
    </PageShell>
  )
}

export default ProcessorsPage
