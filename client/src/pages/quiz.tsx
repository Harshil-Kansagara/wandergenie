import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import TripForm from "@/components/trip-form";

async function fetchQuizQuestions() {
  const response = await fetch("/api/quiz/questions");
  if (!response.ok) {
    throw new Error("Failed to fetch quiz questions");
  }
  return response.json();
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export default function QuizPage() {
  const { data: questions, isLoading, error } = useQuery<any[]>({
    queryKey: ["quizQuestions"],
    queryFn: fetchQuizQuestions,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    if (selectedOption) {
      setDirection(1);
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
    const prevAnswerKey = questions?.[currentQuestionIndex - 1]?.id;
    if (prevAnswerKey) {
      setSelectedOption(answers[prevAnswerKey]?.option_text || null);
    }
  };

  const handleSelectOption = (questionId: string, option: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setSelectedOption(option.option_text);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Quiz...</div>;
  }

  if (error || !questions) {
    return <div className="flex justify-center items-center h-screen">Failed to load quiz. Please try again.</div>;
  }

  const isQuizFinished = currentQuestionIndex >= questions.length;

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {isQuizFinished ? (
          <motion.div
            key="trip-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            <Card className="p-8">
              <CardContent>
                <h2 className="text-3xl font-bold text-center mb-2">Almost there!</h2>
                <p className="text-muted-foreground text-center mb-8">
                  Just a few more details to craft your perfect journey.
                </p>
                <TripForm />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={currentQuestionIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-4xl"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    {currentQuestionIndex > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    )}
                  </div>
                  <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                  {questions[currentQuestionIndex].question_text}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {questions[currentQuestionIndex].options.map((option: any) => (
                    <motion.div
                      key={option.option_text}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedOption === option.option_text
                            ? "border-primary ring-2 ring-primary"
                            : "border-border"
                        }`}
                        onClick={() => handleSelectOption(questions[currentQuestionIndex].id, option)}
                      >
                        <div className="relative h-40">
                          <img
                            src={option.image_url}
                            alt={option.option_text}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                        <div className="p-4 text-center">
                          <p className="font-medium">{option.option_text}</p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={!selectedOption}
                    className="px-12"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
