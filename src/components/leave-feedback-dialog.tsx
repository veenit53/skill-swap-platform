
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addReviewToProfile, getProfileById } from '@/services/profile';
import { markReviewSubmitted } from '@/services/requests';
import { Star } from 'lucide-react';

const feedbackSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.'),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface LeaveFeedbackDialogProps {
  children: React.ReactNode;
  requestId?: string; // Make requestId optional
  fromUserId: string;
  toProfile: Pick<Profile, 'id' | 'name' | 'avatarUrl'>;
  onFeedbackSubmitted: () => void;
}

export function LeaveFeedbackDialog({ children, requestId, fromUserId, toProfile, onFeedbackSubmitted }: LeaveFeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = (data: FeedbackFormValues) => {
    const fromUserProfile = getProfileById(fromUserId);
    if (!fromUserProfile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find your profile to submit review.",
      });
      return;
    }

    addReviewToProfile(toProfile.id, {
        fromUserId: fromUserId,
        fromUserName: fromUserProfile.name,
        fromUserAvatarUrl: fromUserProfile.avatarUrl,
        rating: data.rating,
        comment: data.comment,
    });
    
    // Only mark review as submitted if it's part of a swap request
    if (requestId) {
      markReviewSubmitted(requestId, fromUserId);
    }

    toast({
      title: 'Feedback Submitted!',
      description: `Your review for ${toProfile.name} has been saved.`,
    });

    onFeedbackSubmitted(); // This will trigger a re-render
    setOpen(false);
    form.reset();
  };
  
  const rating = form.watch('rating');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave Feedback for {toProfile.name}</DialogTitle>
          <DialogDescription>
            Share your experience to help other members of the community.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`cursor-pointer h-8 w-8 transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`}
                                onClick={() => field.onChange(star)}
                            />
                        ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your experience..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Submit Feedback</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
