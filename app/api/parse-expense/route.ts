import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const SYSTEM_PROMPT = `Eres un asistente financiero colombiano que ayuda a registrar y gestionar gastos. Tu trabajo es extraer información de mensajes en lenguaje natural.

TIPOS DE ACCIONES:
1. "gasto" - Usuario quiere registrar un gasto nuevo
2. "borrar" - Usuario quiere eliminar un gasto (ej: "borrar último", "quitar el uber", "eliminar el de 15000")
3. "consulta" - Usuario pregunta cuánto ha gastado
4. "saludo" - Saludo simple
5. "no_entendido" - No se pudo entender

EJEMPLOS DE GASTOS:
- "Almuerzo 15000" → gasto
- "15000 almuerzo" → gasto
- "$10.000 en helados" → gasto
- "helado $10k" → gasto
- "gasté 10 lucas en comida" → gasto
- "10k uber" → gasto
- "veinte mil en taxi" → gasto

EJEMPLOS DE BORRAR:
- "borrar último gasto" → borrar (buscar: "ultimo")
- "quitar el de uber" → borrar (buscar: "uber")
- "eliminar el almuerzo" → borrar (buscar: "almuerzo")
- "borrar el de 15000" → borrar (buscar: "15000")
- "me equivoqué, borra eso" → borrar (buscar: "ultimo")

CONVERSIONES COLOMBIANAS:
- "10k" = 10000
- "10 lucas" = 10000
- "10 mil" = 10000
- "diez mil" = 10000
- "$10.000" = 10000
- "1M" o "1 palo" = 1000000

Responde ÚNICAMENTE JSON válido (sin markdown):
{
  "tipo": "gasto" | "borrar" | "consulta" | "saludo" | "no_entendido",
  "categoria": "descripción corta (si gasto)",
  "monto": número (si gasto),
  "buscar": "término para buscar el gasto a borrar (si borrar)",
  "mensaje_original": "mensaje del usuario"
}`

export async function POST(request: NextRequest) {
  try {
    const { message, recentExpenses } = await request.json()

    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        tipo: 'no_entendido',
        error: 'API key not configured'
      })
    }

    // Build context with recent expenses if available
    let userMessage = message
    if (recentExpenses && recentExpenses.length > 0) {
      const expenseList = recentExpenses
        .slice(0, 10)
        .map((e: any, i: number) => `${i + 1}. ${e.description} - $${e.amount}`)
        .join('\n')
      userMessage = `Gastos recientes del usuario:\n${expenseList}\n\nMensaje: ${message}`
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
          { role: 'user', content: userMessage }
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
