import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../services/authServices";
import { RootState } from "../store/store";
import { loginFailure, loginStart, loginSuccess } from "../store/slices/authSlice";

// 🔹 Zod schema for form validation
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema
    .extend({
        name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").trim(),
        confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords must match",
    });

// 🔹 InputField component (Reusable Input Fields)
const InputField: React.FC<{
    name: string;
    type: string;
    label: string;
    control: any;
    errors: any;
}> = ({ name, type, label, control, errors }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-white">{label}</label>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <input
                    id={name}
                    {...field}
                    type={type}
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )}
        />
        {errors[name] && <p className="text-red-500 text-sm">{errors[name]?.message}</p>}
    </div>
);

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state: RootState) => state.auth);

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

    // 🔹 Check for existing token and redirect user
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const user = localStorage.getItem("user");

        if (token && role && user) {
            try {
                const parsedUser = JSON.parse(user);
                dispatch(loginSuccess({ token, role, user: parsedUser }));

                navigate(role === "admin" ? "/admin/dashboard" : "/employee/dashboard", { replace: true });
            } catch (error) {
                console.error("🔴 Error parsing user data:", error);
            }
        }
    }, [dispatch, navigate]);

    const toggleForm = () => setIsLogin(!isLogin);

    // 🔹 Form submission handler
    const onSubmit = async (data: any) => {
        dispatch(loginStart());
        try {

            let response;
            if (isLogin) {
                const loginData = { email: data.email, password: data.password };
                response = await loginUser(loginData);
            } else {
                const signupData = {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                };
                response = await signupUser(signupData);
            }


            if (!response || !response.token) {
                console.error("❌ Response does not contain a token:", response);
                throw new Error("Invalid response format: Missing token");
            }

            if (isLogin) {
                const { token, role, user } = response;

                toast.success("🎉 Login successful!");
                localStorage.setItem("token", token);
                localStorage.setItem("role", role);
                localStorage.setItem("user", JSON.stringify(user));

                dispatch(loginSuccess({ token, user, role }));

                navigate(role === "admin" ? "/admin/dashboard" : "/employee/dashboard", { replace: true });
            } else {
                toast.success("✅ Signup successful! Please log in.");
                reset();
                setIsLogin(true);
            }
        } catch (error: any) {
            console.error("🔴 Login Error:", error);
            toast.error(error.response?.data?.message || (isLogin ? "Login failed." : "Signup failed."));
            dispatch(loginFailure());
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
            <div className="flex-grow flex justify-center items-center py-6 px-4 md:px-8">
                <div className="bg-gradient-to-l from-gray-900 to-indigo-900 text-white shadow-lg p-8 rounded-lg max-w-lg w-full overflow-hidden">
                    <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? "Login" : "Sign Up"}</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {!isLogin && <InputField name="name" type="text" label="Name" control={control} errors={errors} />}
                            <InputField name="email" type="email" label="Email" control={control} errors={errors} />
                            <InputField name="password" type="password" label="Password" control={control} errors={errors} />
                            {!isLogin && <InputField name="confirmPassword" type="password" label="Confirm Password" control={control} errors={errors} />}
                        </div>
                        <div className="mb-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-2 rounded-lg ${isLoading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"} text-white focus:outline-none`}
                            >
                                {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                            </button>
                        </div>
                        <div className="text-center">
                            <button type="button" onClick={toggleForm} className="text-blue-500 hover:underline">
                                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auth;