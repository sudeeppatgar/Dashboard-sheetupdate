import PageShell from '../../../shared/components/PageShell'
import NameResourceSection, { type NameResourceSectionProps } from './NameResourceSection'

type MakeModelsPageProps = {
  resource: NameResourceSectionProps
}

function MakeModelsPage({ resource }: MakeModelsPageProps) {
  return (
    <PageShell>
      <NameResourceSection {...resource} />
    </PageShell>
  )
}

export default MakeModelsPage
