import { NextRequest, NextResponse } from 'next/server'

const GIPHY_BASE = 'https://api.giphy.com/v1/gifs'
const GIPHY_LIMIT = 20
const GIPHY_RATING = 'g'

export async function GET(request: NextRequest) {
  const apiKey = process.env.GIPHY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GIPHY_API_KEY is not configured' }, { status: 500 })
  }

  const { searchParams } = request.nextUrl
  const query = searchParams.get('q')

  const giphyUrl = query
    ? `${GIPHY_BASE}/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=${GIPHY_LIMIT}&rating=${GIPHY_RATING}`
    : `${GIPHY_BASE}/trending?api_key=${apiKey}&limit=${GIPHY_LIMIT}&rating=${GIPHY_RATING}`

  try {
    const res = await fetch(giphyUrl)
    if (!res.ok) {
      return NextResponse.json({ error: `GIPHY error: ${res.status}` }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('GIPHY proxy fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch from GIPHY' }, { status: 500 })
  }
}
