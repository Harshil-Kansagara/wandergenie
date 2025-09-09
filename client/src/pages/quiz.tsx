import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, PartyPopper } from "lucide-react";
import TripForm from "@/components/trip-form";
import { ApiClient } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";

const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);

/**
 * Fetches quiz questions from the API.
 */
function fetchQuizQuestions() {
  return apiClient.get("/api/quiz/questions");
}

function fetchPersonas() {
  return apiClient.get("/api/personas");
}

/**
 * Calculates the user's persona based on their answers.
 * @param answers - A record of question IDs to selected option data.
 */
function calculatePersona(answers: Record<string, any>) {
  console.log("answers", answers);
  return apiClient.post("/api/quiz/calculate-persona", { answers });
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
  const { data: questions, isLoading, error } = useQuery<any[], ApiError>({
    queryKey: ["quizQuestions"],
    queryFn: fetchQuizQuestions,
  });

  const { data: personas } = useQuery<any[]>({
    queryKey: ["personas"],
    queryFn: fetchPersonas,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [dominantPersona, setDominantPersona] = useState<string | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);

  const mutation = useMutation<any, ApiError, Record<string, any>>({
    mutationFn: calculatePersona,
    onSuccess: (data) => {
      setDominantPersona(data.persona);
    },
    // No need for onError here if we handle it directly from the mutation state,
    // but you could add global logic here too, e.g., for logging.
    // onError: (error) => { console.error("Mutation failed:", error); }
  });

  const handleNext = () => {
    if (selectedOption) {
      setDirection(1);
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      if (nextIndex === questions?.length) {
        mutation.mutate(answers);
      }
      setSelectedOption(null);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex <= 0) return;

    setDirection(-1);
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);

    // Restore the selected option for the previous question
    const prevQuestionId = questions?.[prevIndex]?.id;
    const prevAnswer = prevQuestionId ? answers[prevQuestionId] : null;

    setSelectedOption(prevAnswer?.option_text || null);
  };

  const handleSelectOption = (questionId: string, option: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setSelectedOption(option.option_text);
  };

  const handleRestart = () => {
    setIsRestarting(true);
    setCurrentQuestionIndex(0); // Reset index immediately before animation
    setDirection(-1); // Animate out to the right

    // Allow the exit animation to complete before resetting the state
    setTimeout(() => {
      setAnswers({});
      setSelectedOption(null);
      setDominantPersona(null);
      mutation.reset();
      setIsRestarting(false);
    }, 500); // This duration should match your animation exit duration
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Quiz...</div>;
  }

  if (error) {
    let errorMessage = "Failed to load quiz. Please try again.";
    if (error instanceof ApiError) {
      // You can customize the message based on the error status or body
      if (error.status === 500) {
        errorMessage = "There was a problem on our server. Please try again later.";
      } else if (error.body?.message) {
        errorMessage = error.body.message;
      }
    }
    return <div className="flex justify-center items-center h-screen text-red-500">{errorMessage}</div>;
  }

  if (!questions) {
    return <div className="flex justify-center items-center h-screen">Something went wrong. Quiz data is not available.</div>;
  }

  const isQuizFinished = currentQuestionIndex >= questions.length;

  const getButtonContent = () => {
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (mutation.isPending && isLastQuestion) {
      return (
        <>
          <div className="animate-spin w-5 h-5 mr-3 border-2 border-background border-t-transparent rounded-full" />
          Calculating...
        </>
      );
    }

    return isLastQuestion ? "Done" : "Continue";
  };

  const renderQuizResult = () => {
    if (mutation.isPending) {
      return (
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="text-muted-foreground">Calculating your traveler persona...</p>
        </CardContent>
      );
    }

    if (dominantPersona && personas) {
      const personaDetails = personas.find(p => p.id === dominantPersona);
      return (
        <div className="text-center">
          <PartyPopper className="h-16 w-16 text-primary mx-auto mb-6" />
          <CardHeader className="p-0">
            <p className="text-lg font-medium text-muted-foreground">You are a...</p>
            <h2 className="text-4xl font-bold tracking-tight text-primary mb-4">
              {personaDetails?.name || dominantPersona}
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
              {personaDetails?.description}
              <br />
              Now, let's craft your perfect journey below.
            </p>
          </CardHeader>
          <Separator className="my-8" />
          <div className="px-4 text-left">
            <h3 className="text-2xl font-bold text-center mb-2">
              Create Your Perfect Trip
            </h3>
            <TripForm persona={dominantPersona} renderInCard={false} />
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" onClick={handleRestart}>Restart Quiz</Button>
          </div>
        </div>
      );
    }

    // Default to the error/retry state
    const errorMessage = mutation.error instanceof ApiError
      ? mutation.error.body?.message || "Could not determine your persona."
      : "An unexpected error occurred. Please try again.";

    return (
      <CardContent className="pt-6 text-center text-red-500">
        <p>{errorMessage}</p>
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={() => mutation.mutate(answers)}>Try Again</Button>
          <Button variant="outline" onClick={handleRestart}>Restart Quiz</Button>
        </div>
      </CardContent>
    );
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        {isQuizFinished && !isRestarting ? (
          <motion.div
            key="trip-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            <Card className="p-8">
              {renderQuizResult()}
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
                    onClick={handleNext} // This will trigger the mutation on the last question
                    disabled={!selectedOption || mutation.isPending}
                    className="px-12"
                  >
                    {getButtonContent()}
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
