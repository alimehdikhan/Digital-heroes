import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errors, formatApiError } from '@/lib/utils/errors'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ scoreId: string }> }
) {
  try {
    const { scoreId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ data: { deleted: true }, error: null })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
