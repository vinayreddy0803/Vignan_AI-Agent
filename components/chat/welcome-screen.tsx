'use client'

import { GraduationCap, BookOpen, Code, Lightbulb, FileText, CheckCircle, Info } from 'lucide-react'

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void
}

const suggestions = [
  {
    icon: BookOpen,
    title: 'Course Information',
    description: 'What courses does Vignan offer?',
  },
  {
    icon: GraduationCap,
    title: 'Admissions',
    description: 'Tell me about admissions process',
  },
  {
    icon: Lightbulb,
    title: 'Campus Facilities',
    description: 'What facilities are available?',
  },
  {
    icon: Code,
    title: 'Placements',
    description: 'What about placement statistics?',
  },
]

const capabilities = [
  'Answer questions about Vignan University courses and programs',
  'Provide admission procedures and eligibility requirements',
  'Share campus facilities and infrastructure details',
  'Discuss placement records and top recruiters',
  'Help with university-related information',
]

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
          Welcome to VIGNAN AI
        </h1>
        <p className="text-muted-foreground max-w-md">
          Your intelligent assistant for Vignan University
        </p>
      </div>

      {/* AI Capabilities Section */}
      <div className="w-full max-w-2xl mb-8 p-4 md:p-6 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">What I Can Help You With</h2>
        </div>
        <ul className="space-y-2">
          {capabilities.map((capability, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{capability}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggestion Cards */}
      <div className="w-full max-w-2xl">
        <p className="text-sm font-medium text-foreground mb-3">Quick Questions</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              onClick={() => onSuggestionClick(suggestion.description)}
              className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <suggestion.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-foreground mb-0.5">
                  {suggestion.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {suggestion.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
