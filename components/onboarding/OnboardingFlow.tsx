'use client'

import { useState } from 'react'
import Step1Welcome from './Step1Welcome'
import Step2Income from './Step2Income'
import Step3FixedExpenses from './Step3FixedExpenses'
import Step3bSavings from './Step3bSavings'
import Step4Revelation from './Step4Revelation'

interface FixedExpense {
  id: string
  name: string
  icon: string
  amount: number
  selected: boolean
}

interface UserData {
  income: number
  fixedExpenses: FixedExpense[]
  savings: number
}

interface Props {
  onComplete: (data: UserData) => void
}

export default function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [income, setIncome] = useState(0)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [savings, setSavings] = useState(0)

  const handleIncomeSubmit = (value: number) => {
    setIncome(value)
    setStep(3)
  }

  const handleExpensesSubmit = (expenses: FixedExpense[]) => {
    setFixedExpenses(expenses)
    setStep(4) // Step 3b - Savings
  }

  const handleSavingsSubmit = (savingsAmount: number) => {
    setSavings(savingsAmount)
    setStep(5) // Step 4 - Revelation
  }

  const handleComplete = () => {
    onComplete({ income, fixedExpenses, savings })
  }

  return (
    <div className="min-h-screen">
      {step === 1 && (
        <Step1Welcome onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <Step2Income
          onNext={handleIncomeSubmit}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3FixedExpenses
          onNext={handleExpensesSubmit}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step3bSavings
          onNext={handleSavingsSubmit}
          onBack={() => setStep(3)}
          initialValue={savings}
        />
      )}
      {step === 5 && (
        <Step4Revelation
          income={income}
          fixedExpenses={fixedExpenses}
          savings={savings}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
