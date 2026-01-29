import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const SYSTEM_PROMPT = `Eres un asistente financiero colombiano que ayuda a registrar gastos. Tu trabajo es extraer información de mensajes en lenguaje natural.

IMPORTANTE: Debes entender CUALQUIER formato de mensaje sobre gastos, sin importar el orden de las palabras.

Ejemplos de mensajes que debes entender:
- "Almuerzo 15000" → gasto
- "15000 almuerzo" → gasto
- "$10.000 en helados" → gasto
- "helado $10k" → gasto
- "gasté 10 lucas en comida" → gasto
- "me comí un helado de diez mil" → gasto
- "10k uber" → gasto
- "transporte veinte mil" → gasto
- "¿cuánto llevo?" → consulta
- "¿cuánto he gastado?" → consulta
- "resumen" → consulta
- "hola" → saludo

Conversiones de dinero colombiano:
- "10k" = 10000
- "10 lucas" = 10000
- "10 mil" = 10000
- "diez mil" = 10000
- "$10.000" = 10000
- "1M" = 1000000
- "1 palo" = 1000000

Responde ÚNICAMENTE con JSON válido (sin markdown, sin \`\`\`):
{
  "tipo": "gasto" | "consulta" | "saludo" | "no_entendido",
  "categoria": "descripción corta del gasto (si es gasto)",
  "monto": número sin puntos ni símbolos (si es gasto),
  "mensaje_original": "el mensaje del usuario"
}

Si no puedes extraer el monto con certeza, usa tipo "no_entendido".`

export async function POST(request: NextRequest) {
  try {
    const { message, availableMoney, totalSpent } = await request.json()

    if (!OPENAI_API_KEY) {
      // Fallback to simple parsing if no API key
      return NextResponse.json({
        tipo: 'no_entendido',
        error: 'API key not configured'
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
        max_tokens: 150
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json({
        tipo: 'error',
        error: 'Error al procesar mensaje'
      })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    try {
      // Parse the JSON response from OpenAI
      const parsed = JSON.parse(content)
      return NextResponse.json(parsed)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      return NextResponse.json({
        tipo: 'no_entendido',
        error: 'No pude entender la respuesta'
      })
    }

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({
      tipo: 'error',
      error: 'Error interno'
    }, { status: 500 })
  }
}
