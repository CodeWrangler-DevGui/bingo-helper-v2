"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push("/");
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert("Conta criada com sucesso! Entre na arena.");
                setIsLogin(true); 
            }
        } catch (err) {
            const error = err as Error;
            setErrorMsg(error.message === "Invalid login credentials"
                ? "E-mail ou senha incorretos, parceiro."
                : error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-indigo-100 w-full max-w-md">

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Bingo Helper</h1>
                    <p className="text-slate-400 font-medium uppercase text-xs tracking-widest mt-2">
                        {isLogin ? "Entre na Arena" : "Crie seu acesso"}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* 👉 Substituímos o .formFields do CSS por Tailwind: flex, gap-6, mb-8 */}
                    <div className="flex flex-col gap-6 mb-8">
                        
                        {/* Campo de E-mail 100% Tailwind */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="teste@peao.com"
                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-bold text-lg outline-none transition-all duration-300 placeholder:text-slate-400 placeholder:font-medium focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/15"
                        />

                        {/* Campo de Senha 100% Tailwind */}
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Senha de 6 caracteres"
                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-bold text-lg outline-none transition-all duration-300 placeholder:text-slate-400 placeholder:font-medium focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/15"
                        />
                    </div>

                    {errorMsg && (
                        <p className="text-red-500 text-sm font-bold text-center -mt-4 mb-4">
                            ⚠️ {errorMsg}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                        {loading ? "Aguarde..." : (isLogin ? "ENTRAR" : "CADASTRAR")}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors"
                    >
                        {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login agora"}
                    </button>
                </div>
            </div>
        </main>
    );
}