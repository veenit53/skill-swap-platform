
// "use client";

// import { useState, useRef, useEffect } from 'react';
// import { useForm, useFieldArray, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import type { Profile } from '@/lib/types';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { useToast } from '@/hooks/use-toast';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import { Camera, Plus, X } from 'lucide-react';
// import { Badge } from './ui/badge';

// const skillSchema = z.object({ value: z.string().min(1, 'Skill cannot be empty.') });

// const profileSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
//   location: z.string().optional(),
//   availability: z.string().min(1, 'Availability is required'),
//   skillsOffered: z.array(skillSchema).min(1, 'Please list at least one skill to offer.'),
//   skillsWanted: z.array(skillSchema).min(1, 'Please list at least one skill you want.'),
//   avatarUrl: z.string().optional(),
// });

// type ProfileFormValues = z.infer<typeof profileSchema>;

// interface EditProfileDialogProps {
//   children: React.ReactNode;
//   profile: Profile;
//   onProfileUpdate: (updatedProfile: Profile) => void;
// }

// const SkillsInput = ({ control, name, label, placeholder }: { control: any, name: "skillsOffered" | "skillsWanted", label: string, placeholder: string }) => {
//     const { fields, append, remove } = useFieldArray<{ value: string }>({
//       control,
//       name,
//     });
//     const [newSkill, setNewSkill] = useState('');
  
//     const handleAddSkill = () => {
//       if (newSkill.trim() !== '') {
//         append({ value: newSkill.trim() });
//         setNewSkill('');
//       }
//     };

//     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (e.key === 'Enter') {
//             e.preventDefault();
//             handleAddSkill();
//         }
//     }
  
//     return (
//       <FormItem>
//         <FormLabel>{label}</FormLabel>
//         <div className="flex flex-wrap gap-2 mb-2">
//           {fields.map((field, index) => (
//             <Badge key={field.id} variant="secondary" className="flex items-center gap-1.5 text-sm py-1 px-3">
//               {field.value}
//               <button type="button" onClick={() => remove(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
//                 <X className="h-3 w-3" />
//               </button>
//             </Badge>
//           ))}
//         </div>
//         <div className="flex gap-2 items-center">
//             <Input 
//                 value={newSkill} 
//                 onChange={(e) => setNewSkill(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder={placeholder}
//             />
//             <Button type="button" size="icon" variant="outline" onClick={handleAddSkill}>
//                 <Plus className="h-4 w-4" />
//             </Button>
//         </div>
//         <FormMessage />
//       </FormItem>
//     );
//   };

// export function EditProfileDialog({ children, profile, onProfileUpdate }: EditProfileDialogProps) {
//   const [open, setOpen] = useState(false);
//   const { toast } = useToast();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatarUrl);

//   const form = useForm<ProfileFormValues>({
//     resolver: zodResolver(profileSchema),
//     defaultValues: {
//       name: profile.name,
//       location: profile.location || '',
//       availability: profile.availability,
//       skillsOffered: profile.skillsOffered.map(s => ({ value: s })),
//       skillsWanted: profile.skillsWanted.map(s => ({ value: s })),
//       avatarUrl: profile.avatarUrl,
//     },
//   });

//   useEffect(() => {
//     if (open) {
//         form.reset({
//             name: profile.name,
//             location: profile.location || '',
//             availability: profile.availability,
//             skillsOffered: profile.skillsOffered.map(s => ({ value: s })),
//             skillsWanted: profile.skillsWanted.map(s => ({ value: s })),
//             avatarUrl: profile.avatarUrl,
//         });
//         setAvatarPreview(profile.avatarUrl);
//     }
//   }, [open, profile, form]);

//   const handleAvatarClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const dataUrl = reader.result as string;
//         setAvatarPreview(dataUrl);
//         form.setValue('avatarUrl', dataUrl);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const onSubmit = (data: ProfileFormValues) => {
//     const updatedProfile: Profile = {
//         ...profile,
//         ...data,
//         skillsOffered: data.skillsOffered.map(s => s.value),
//         skillsWanted: data.skillsWanted.map(s => s.value),
//     };
    
//     onProfileUpdate(updatedProfile);
    
//     toast({
//       title: 'Profile Updated',
//       description: 'Your changes have been saved.',
//     });
//     setOpen(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>{children}</DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Edit profile</DialogTitle>
//           <DialogDescription>
//             Make changes to your profile here. Click save when you're done.
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
//              <div className="flex justify-center">
//                 <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
//                     <Avatar className="h-24 w-24 border-2 border-primary/50">
//                         <AvatarImage src={avatarPreview} alt={profile.name} data-ai-hint="person portrait" />
//                         <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
//                     </Avatar>
//                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
//                         <Camera className="h-8 w-8 text-white" />
//                     </div>
//                 </div>
//                 <FormField
//                   control={form.control}
//                   name="avatarUrl"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <Input 
//                             type="file" 
//                             className="hidden" 
//                             ref={fileInputRef}
//                             onChange={handleFileChange}
//                             accept="image/png, image/jpeg"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//             </div>

//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Name</FormLabel>
//                   <FormControl>
//                     <Input {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="location"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Location</FormLabel>
//                   <FormControl>
//                     <Input {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="availability"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Weekly Availability</FormLabel>
//                   <FormControl>
//                     <Input {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
           
//             <Controller
//                 control={form.control}
//                 name="skillsOffered"
//                 render={() => (
//                     <SkillsInput
//                         control={form.control}
//                         name="skillsOffered"
//                         label="Skills You Offer"
//                         placeholder="e.g. React"
//                     />
//                 )}
//             />

//             <Controller
//                 control={form.control}
//                 name="skillsWanted"
//                 render={() => (
//                     <SkillsInput
//                         control={form.control}
//                         name="skillsWanted"
//                         label="Skills You Want"
//                         placeholder="e.g. Firebase"
//                     />
//                 )}
//             />
            
//             <DialogFooter>
//               <Button type="submit">Save changes</Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { useState, useRef, useEffect } from 'react';
import {
  useForm,
  useFieldArray,
  Controller,
  Control
} from 'react-hook-form';
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
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from './ui/avatar';
import { Camera, Plus, X } from 'lucide-react';
import { Badge } from './ui/badge';

// ---------------- Schema ----------------
const skillSchema = z.object({
  value: z.string().min(1, 'Skill cannot be empty.')
});

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().optional(),
  availability: z.string().min(1, 'Availability is required'),
  skillsOffered: z.array(skillSchema).min(1, 'Please list at least one skill to offer.'),
  skillsWanted: z.array(skillSchema).min(1, 'Please list at least one skill you want.'),
  avatarUrl: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ---------------- Props ----------------
interface EditProfileDialogProps {
  children: React.ReactNode;
  profile: Profile;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

interface SkillsInputProps {
  control: Control<ProfileFormValues>;
  name: 'skillsOffered' | 'skillsWanted';
  label: string;
  placeholder: string;
}

// ---------------- SkillsInput ----------------
const SkillsInput = ({ control, name, label, placeholder }: SkillsInputProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name
  });

  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() !== '') {
      append({ value: newSkill.trim() });
      setNewSkill('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex flex-wrap gap-2 mb-2">
        {fields.map((field, index) => (
          <Badge
            key={field.id}
            variant="secondary"
            className="flex items-center gap-1.5 text-sm py-1 px-3"
          >
            {field.value}
            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleAddSkill}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <FormMessage />
    </FormItem>
  );
};

// ---------------- Main Component ----------------
export function EditProfileDialog({
  children,
  profile,
  onProfileUpdate
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    profile.avatarUrl
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      location: profile.location || '',
      availability: profile.availability,
      skillsOffered: profile.skillsOffered.map((s) => ({ value: s })),
      skillsWanted: profile.skillsWanted.map((s) => ({ value: s })),
      avatarUrl: profile.avatarUrl
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: profile.name,
        location: profile.location || '',
        availability: profile.availability,
        skillsOffered: profile.skillsOffered.map((s) => ({ value: s })),
        skillsWanted: profile.skillsWanted.map((s) => ({ value: s })),
        avatarUrl: profile.avatarUrl
      });
      setAvatarPreview(profile.avatarUrl);
    }
  }, [open, profile, form]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        form.setValue('avatarUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    const updatedProfile: Profile = {
      ...profile,
      ...data,
      skillsOffered: data.skillsOffered.map((s) => s.value),
      skillsWanted: data.skillsWanted.map((s) => s.value)
    };

    onProfileUpdate(updatedProfile);

    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved.'
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="flex justify-center">
              <div
                className="relative group cursor-pointer"
                onClick={handleAvatarClick}
              >
                <Avatar className="h-24 w-24 border-2 border-primary/50">
                  <AvatarImage
                    src={avatarPreview}
                    alt={profile.name}
                    data-ai-hint="person portrait"
                  />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Availability</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="skillsOffered"
              render={() => (
                <SkillsInput
                  control={form.control}
                  name="skillsOffered"
                  label="Skills You Offer"
                  placeholder="e.g. React"
                />
              )}
            />

            <Controller
              control={form.control}
              name="skillsWanted"
              render={() => (
                <SkillsInput
                  control={form.control}
                  name="skillsWanted"
                  label="Skills You Want"
                  placeholder="e.g. Firebase"
                />
              )}
            />

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
