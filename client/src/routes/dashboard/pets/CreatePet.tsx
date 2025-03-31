import axios from 'axios';
import * as z from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { format } from "date-fns";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../../components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { Input } from '../../../components/ui/input';
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from 'react';

const CreatePet = () => {
    const allDogBreeds = [
        "Golden Retriever", "Labrador Retriever", "German Shepherd", "Beagle", "Bulldog", "Poodle", "Rottweiler",
        "Boxer", "Siberian Husky", "Dachshund", "Australian Shepherd", "Shih Tzu", "Chihuahua", "Border Collie",
        "Great Dane", "Doberman Pinscher", "Pug", "Cocker Spaniel", "Maltese", "Akita", "Basset Hound",
        "Shetland Sheepdog", "Weimaraner", "Newfoundland", "Saint Bernard"
    ];

    const allCatBreeds = [
        "Persian", "Maine Coon", "Siamese", "Ragdoll", "Bengal", "Sphynx", "Scottish Fold", "British Shorthair",
        "Abyssinian", "American Shorthair", "Burmese", "Russian Blue", "Himalayan", "Norwegian Forest Cat",
        "Devon Rex", "Oriental Shorthair", "Manx", "Birman", "Cornish Rex", "Turkish Angora", "Tonkinese",
        "Ragamuffin", "Balinese", "Chartreux", "Selkirk Rex"
    ];

    const vaccineTypes = ["Rabies", "Parvovirus", "Distemper", "Hepatitis", "Leptospirosis", "Bordetella"];

    const [filteredBreeds, setFilteredBreeds] = useState<string[]>(allDogBreeds);

    const generateFormSchema = z.object({
        name: z.string().min(1),
        contact: z.string().min(1, "Contact is required"),
        address: z.string().min(1, "Address is required"),
        comments: z.string().min(0).max(160),
        petType: z.enum(["dog", "cat"]),
        dob: z.date(),
        rfidNumber: z.string().min(1).max(160),
        breed1: z.string().min(1),
        breed2: z.string().min(1),
        vaccinationType: z.string().min(1),
        vaccinationCount: z.string().regex(/^\d+$/, "Please enter a valid number"),
    });

    type GenerateFormValues = z.infer<typeof generateFormSchema>;

    const form = useForm<GenerateFormValues>({
        resolver: zodResolver(generateFormSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            comments: '',
            contact: '',
            address: '',
            petType: 'dog',
            dob: new Date(),
            rfidNumber: "",
            breed1: "",
            breed2: "",
            vaccinationType: "",
            vaccinationCount: '',
        },
    });

    const petType = form.watch("petType");

    useEffect(() => {
        if (petType === "dog") {
            setFilteredBreeds(allDogBreeds);
        } else if (petType === "cat") {
            setFilteredBreeds(allCatBreeds);
        }
    }, [petType]);

    const onSubmit = async (data: GenerateFormValues) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        console.log(data);
        if (!userId) return;

        const petData = {
            ...data,
            ownerId: userId,
        };

        try {
            const response = await axios.post('http://localhost:5000/api/pets', petData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (response.status === 201) {
                console.log('Pet successfully added!');
            } else {
                console.error('Failed to add pet', response.data);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error submitting form:', error.response?.data || error.message);
            } else {
                console.error('Error submitting form:', error);
            }
        }
    };

    return (
        <div className='wrapper'>
            <div className="md:max-w-3xl lg:max-w-5xl mx-auto mt-32">
                <h1 className="font-bold mb-12 text-4xl sm:text-5xl">Add a New Pet</h1>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Pet's name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                                                {/* New contact field */}
                                                <FormField
                            control={form.control}
                            name="contact"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel>Contact Information</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your contact information" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                                                                        {/* New address field */}
                                                                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="comments"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel>Comments</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional comments about the pet" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid sm:grid-cols-2 grid-cols-1 gap-3 text-center text-gray-500 text-sm my-2 mb-6">
                            <button
                                type="button"
                                className={`border p-2 rounded-2xl transition ${petType === 'dog' ? 'bg-neutral-700 text-white' : 'hover:bg-gray-100'}`}
                                onClick={() => form.setValue('petType', 'dog')}>
                                Dog
                            </button>
                            <button
                                type="button"
                                className={`border p-2 rounded-2xl transition ${petType === 'cat' ? 'bg-neutral-700 text-white' : 'hover:bg-gray-100'}`}
                                onClick={() => form.setValue('petType', 'cat')}>
                                Cat
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <FormField
                                control={form.control}
                                name="breed1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Breed 1</FormLabel>
                                        <FormControl>
                                            <select className="border p-2 rounded-md w-full text-sm" {...field}>
                                                <option value="" disabled>Select Breed 1</option>
                                                {filteredBreeds.map((breed) => (
                                                    <option key={breed} value={breed}>
                                                        {breed}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="breed2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Breed 2</FormLabel>
                                        <FormControl>
                                            <select className="border p-2 rounded-md w-full text-sm" {...field}>
                                                <option value="" disabled>Select Breed 2</option>
                                                {filteredBreeds.map((breed) => (
                                                    <option key={breed} value={breed}>
                                                        {breed}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="dob"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Birth</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline">
                                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" onSelect={field.onChange} />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="rfidNumber"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel>RFID Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="RFID Number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vaccinationType"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel>Vaccination Type</FormLabel>
                                    <FormControl>
                                        <select className="border p-2 rounded-md w-full text-sm" {...field}>
                                            <option value="" disabled>Select Vaccination Type</option>
                                            {vaccineTypes.map((vaccine) => (
                                                <option key={vaccine} value={vaccine}>
                                                    {vaccine}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vaccinationCount"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel>Number of Vaccinations</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter vaccination count"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full mt-6">Submit</Button>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};

export default CreatePet;
