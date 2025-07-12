
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSwapRequest } from '@/services/requests';

const requestSwapSchema = z.object({
  offeredSkill: z.string().min(1, 'Please select a skill to offer.'),
  wantedSkill: z.string().min(1, 'Please select a skill you want.'),
  message: z.string().optional(),
});

type RequestSwapFormValues = z.infer<typeof requestSwapSchema>;

interface RequestSwapDialogProps {
  children: React.ReactNode;
  currentUserProfile: Profile;
  targetProfile: Profile;
}

export function RequestSwapDialog({ children, currentUserProfile, targetProfile }: RequestSwapDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<RequestSwapFormValues>({
    resolver: zodResolver(requestSwapSchema),
    defaultValues: {
      offeredSkill: '',
      wantedSkill: '',
      message: '',
    },
  });

  const onSubmit = (data: RequestSwapFormValues) => {
    createSwapRequest({
        fromUser: { id: currentUserProfile.id, name: currentUserProfile.name, avatarUrl: currentUserProfile.avatarUrl },
        toUser: { id: targetProfile.id, name: targetProfile.name, avatarUrl: targetProfile.avatarUrl },
        offeredSkill: data.offeredSkill,
        wantedSkill: data.wantedSkill,
        // message is not part of the SwapRequest type, so we don't pass it here.
        // In a real app you might add it to your data model.
    });
    
    toast({
      title: 'Swap Request Sent!',
      description: `Your request to ${targetProfile.name} has been sent.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Skill Swap</DialogTitle>
          <DialogDescription>
            Propose a swap with {targetProfile.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="offeredSkill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose one of your offered skills</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a skill you offer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentUserProfile.skillsOffered.map(skill => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wantedSkill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose one of their wanted skills</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a skill you want to learn" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {targetProfile.skillsOffered.map(skill => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add an optional message..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
