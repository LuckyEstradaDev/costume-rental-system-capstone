"use client";

import {ReactNode, useState} from "react";
import {StarIcon} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {createReview, updateReview} from "../services/reviewService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {IReview} from "../types/IReview";

const ratings = [1, 2, 3, 4, 5];

export function ReviewModal({
  trigger,
  outfitID,
  review,
  onReviewSaved,
}: {
  trigger: ReactNode;
  outfitID: string;
  review?: IReview;
  onReviewSaved?: () => void;
}) {
  const [selectedRating, setSelectedRating] = useState(review?.stars || 0);
  const {user} = useAuth();
  const [comment, setComment] = useState(review?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(review?._id);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSelectedRating(review?.stars || 0);
      setComment(review?.comment || "");
    }
  };

  const handleSubmit = async () => {
    if (!user?._id || !outfitID || selectedRating < 1) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (review?._id) {
        await updateReview(review._id, {
          stars: selectedRating,
          comment: comment || "",
        });
      } else {
        await createReview({
          outfitID: outfitID,
          userID: user._id,
          userSnapshot: {
            fullname: user.firstName + " " + user.lastName,
          },
          stars: selectedRating,
          comment: comment || "",
        });
      }

      onReviewSaved?.();
    } catch (error) {
      console.log("Error submitting review:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit review" : "Give a review"}
          </DialogTitle>
          <DialogDescription>
            Rate your rental experience and leave a short comment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div
              className="flex items-center gap-2"
              role="radiogroup"
              aria-label="Review rating"
            >
              {ratings.map((rating) => (
                <button
                  key={rating}
                  type="button"
                  role="radio"
                  aria-checked={selectedRating === rating}
                  aria-label={`${rating} star rating`}
                  onClick={() => setSelectedRating(rating)}
                  className="rounded-lg border bg-background p-2 transition-colors hover:border-primary/60 hover:bg-primary/5 aria-checked:border-primary aria-checked:bg-primary/10"
                >
                  <StarIcon
                    className={
                      rating <= selectedRating
                        ? "size-6 fill-amber-400 text-amber-400"
                        : "size-6 text-muted-foreground"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Comments</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              id="review-comment"
              placeholder="Write your feedback here..."
              className="min-h-32 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={isSubmitting || selectedRating < 1}
            onClick={handleSubmit}
          >
            {isEditing ? "Save review" : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
