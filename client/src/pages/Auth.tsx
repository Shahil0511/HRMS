import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000/api";


const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema
    .extend({
        name: z.string().nonempty("Name is required"),
        confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords must match",
    });

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(isLogin ? loginSchema : signupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
        },
    });

    useEffect(() => {
        reset(); // Clear form when toggling between login/signup
    }, [isLogin, reset]);

    const toggleForm = () => setIsLogin(!isLogin);

    const onSubmit = async (data: any) => {
        console.log("Form Data:", data);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signup`, data);
            toast.success("Signup successful! You can now log in.", {
                position: "top-right",
                autoClose: 3000,
            });

            console.log("Signup Successful:", response.data);

            // Reset form and toggle to login mode
            reset();
            setIsLogin(true);
        } catch (error: any) {
            // Detailed error handling
            if (error.response) {
                // Server responded with an error
                console.error("Server Error:", error.response.data);
                toast.error(error.response.data.message || "Signup failed. Please try again.", {
                    position: "top-right",
                    autoClose: 5000,
                });
            } else if (error.request) {
                // Request was made, but no response
                console.error("No Response:", error.request);
                toast.error("No response from the server. Please try again later.", {
                    position: "top-right",
                    autoClose: 5000,
                });
            } else {
                // General error
                console.error("Error:", error.message);
                toast.error("An unexpected error occurred. Please try again.", {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
    };


    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
            <div className="flex-grow flex justify-center items-center py-6 px-4 md:px-8">
                <div className="bg-gradient-to-l from-gray-900 to-indigo-900 text-white shadow-lg p-8 rounded-lg max-w-lg w-full overflow-hidden">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        {isLogin ? "Login" : "Sign Up"}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Name Field */}
                            {!isLogin && (
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-white">
                                        Name
                                    </label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                id="name"
                                                {...field}
                                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        )}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm">{errors.name.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white">
                                    Email
                                </label>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            id="email"
                                            {...field}
                                            type="email"
                                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-white">
                                    Password
                                </label>
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            id="password"
                                            {...field}
                                            type="password"
                                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            {!isLogin && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                                        Confirm Password
                                    </label>
                                    <Controller
                                        name="confirmPassword"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                id="confirmPassword"
                                                {...field}
                                                type="password"
                                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        )}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm">
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="mb-6">
                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {isLogin ? "Login" : "Sign Up"}
                            </button>
                        </div>

                        {/* Toggle Between Forms */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={toggleForm}
                                className="text-blue-500 hover:text-blue-700"
                            >
                                {isLogin
                                    ? "Don't have an account? Sign up here"
                                    : "Already have an account? Login here"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auth;
