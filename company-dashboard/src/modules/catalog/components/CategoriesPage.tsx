import PageShell from '../../../shared/components/PageShell'
import NameResourceSection, { type NameResourceSectionProps } from './NameResourceSection'

type CategoriesPageProps = {
  resource: NameResourceSectionProps
}

function CategoriesPage({ resource }: CategoriesPageProps) {
  return (
    <PageShell>
      <NameResourceSection {...resource} />
    </PageShell>
  )
}

export default CategoriesPage
