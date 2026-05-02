import { NextResponse } from 'next/server'

// Simple rule-based AI agent for Vignan University
class VignanAIAgent {
  private responses: { [key: string]: string[] } = {
    greeting: [
      "Hello! I'm VIGNAN AI, your intelligent assistant for Vignan University. How can I help you today?",
      "Welcome to Vignan University! I'm here to assist you with any questions about academics, campus life, or university services.",
      "Hi there! I'm VIGNAN AI, ready to help you navigate your journey at Vignan University."
    ],

    courses: [
      "Vignan University offers a comprehensive range of undergraduate and postgraduate programs:\n\n**🏫 Engineering Programs:**\n• Computer Science & Engineering (CSE)\n• Electrical & Electronics Engineering (EEE)\n• Electronics & Communication Engineering (ECE)\n• Mechanical Engineering (ME)\n• Civil Engineering (CE)\n• Information Technology (IT)\n\n**💼 Management Programs:**\n• Master of Business Administration (MBA)\n• Bachelor of Business Administration (BBA)\n\n**🔬 Science Programs:**\n• B.Sc, M.Sc in Mathematics, Physics, Chemistry, Biotechnology\n\n**📚 Humanities:**\n• BA, MA in English, Psychology, Sociology\n\nEach program includes industry-relevant curriculum, practical training, and placement assistance.",
    ],

    admissions: [
      "For admissions at Vignan University:\n\n**Eligibility:**\n• 10+2 with minimum 60% for UG programs\n• Bachelor's degree for PG programs\n\n**Entrance Exams:**\n• EAMCET for Engineering\n• ICET for MBA\n• Direct admission based on merit\n\n**Application Process:**\n1. Visit our website\n2. Fill online application\n3. Submit required documents\n4. Pay application fee",
    ],

    facilities: [
      "Vignan University boasts state-of-the-art facilities:\n\n🏫 **Academic Buildings:** Modern classrooms with smart boards\n📚 **Libraries:** Digital and physical collections\n💻 **Computer Labs:** Latest hardware and software\n⚽ **Sports Complex:** Indoor and outdoor facilities\n🏢 **Hostels:** Separate for boys and girls\n🍽️ **Cafeteria:** Multiple dining options\n🏥 **Medical Center:** 24/7 healthcare services",
    ],

    placements: [
      "Vignan University has excellent placement records:\n\n**📊 Placement Statistics:**\n• **Placement Rate:** 98%\n• **Highest Package:** ₹52 LPA\n• **Average Package:** ₹7.2 LPA\n\n**🏢 Top Recruiters:**\n• **Tech Giants:** Google, Microsoft, Amazon, Meta, Adobe\n• **IT Companies:** TCS, Infosys, Wipro, Cognizant\n• **Core Companies:** Tata Steel, L&T, Reliance\n• **Startups:** Paytm, Ola, Swiggy, Zomato",
    ],

    default: [
      "I'm here to help you with information about Vignan University. You can ask me about courses, admissions, facilities, placements, and more. What would you like to know?",
    ]
  }

  private getResponseType(message: string): string {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting'
    }
    if (lowerMessage.includes('course') || lowerMessage.includes('program') || lowerMessage.includes('subject')) {
      return 'courses'
    }
    if (lowerMessage.includes('admission') || lowerMessage.includes('admit') || lowerMessage.includes('join')) {
      return 'admissions'
    }
    if (lowerMessage.includes('facility') || lowerMessage.includes('campus') || lowerMessage.includes('infrastructure')) {
      return 'facilities'
    }
    if (lowerMessage.includes('placement') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
      return 'placements'
    }

    return 'default'
  }

  public generateResponse(message: string): string {
    const responseType = this.getResponseType(message)
    const possibleResponses = this.responses[responseType] || this.responses.default
    return possibleResponses[Math.floor(Math.random() * possibleResponses.length)]
  }
}

const vignanAI = new VignanAIAgent()

export async function POST(req: Request) {
  try {
    const { messages }: { messages: any[] } = await req.json()

    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage?.parts?.find((p: any) => p.type === 'text')?.text || ''

    const aiResponse = vignanAI.generateResponse(userMessage)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`0:${JSON.stringify({ text: aiResponse })}\n`))
        controller.enqueue(encoder.encode('e:{"finishReason":"stop"}\n'))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Experimental-Stream-Data': 'true'
      }
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}





// import { NextResponse } from 'next/server'

// const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434'

// const VIGNAN_SYSTEM_PROMPT = `You are VIGNAN AI, an intelligent assistant for Vignan University. You provide accurate, helpful information about:

// **University Information:**
// - Vignan University is located in Andhra Pradesh, India
// - Founded in 1997
// - Offers engineering, management, and science programs

// **Academic Programs:**
// - Engineering: CSE, ECE, EEE, ME, CE, IT
// - Management: MBA, BBA
// - Science: Mathematics, Physics, Chemistry, Biotechnology

// Always be helpful and enthusiastic about Vignan University.`

// export async function POST(req: Request) {
//   try {
//     const { messages }: { messages: any[] } = await req.json()

//     const formattedMessages = messages.map(msg => ({
//       role: msg.role,
//       content: msg.parts?.find((p: any) => p.type === 'text')?.text || ''
//     }))

//     // Call Ollama API
//     const response = await fetch(`${OLLAMA_URL}/api/chat`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'llama2', // Change to your model name
//         messages: [
//           { role: 'system', content: VIGNAN_SYSTEM_PROMPT },
//           ...formattedMessages
//         ],
//         stream: true,
//       })
//     })

//     if (!response.ok) {
//       throw new Error(`Ollama API error: ${response.statusText}`)
//     }

//     const reader = response.body?.getReader()
//     if (!reader) throw new Error('No response body')

//     const stream = new ReadableStream({
//       async start(controller) {
//         const decoder = new TextDecoder()
//         try {
//           while (true) {
//             const { done, value } = await reader.read()
//             if (done) break

//             const text = decoder.decode(value)
//             const lines = text.split('\n').filter(line => line.trim())

//             for (const line of lines) {
//               try {
//                 const data = JSON.parse(line)
//                 if (data.message?.content) {
//                   controller.enqueue(
//                     new TextEncoder().encode(
//                       `0:${JSON.stringify({ text: data.message.content })}\n`
//                     )
//                   )
//                 }
//               } catch (e) {
//                 // Skip invalid JSON lines
//               }
//             }
//           }
//           controller.enqueue(new TextEncoder().encode('e:{"finishReason":"stop"}\n'))
//         } catch (error) {
//           controller.error(error)
//         } finally {
//           controller.close()
//         }
//       }
//     })

//     return new Response(stream, {
//       headers: {
//         'Content-Type': 'text/plain; charset=utf-8',
//         'X-Experimental-Stream-Data': 'true'
//       }
//     })

//   } catch (error) {
//     console.error('Error in chat API:', error)
//     return NextResponse.json(
//       { error: 'Failed to connect to Ollama. Make sure Ollama is running on http://localhost:11434' },
//       { status: 500 }
//     )
//   }
// }