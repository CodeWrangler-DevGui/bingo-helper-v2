"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Verifique se o caminho está correto

// 👉 PASSO 3.1: Importar os estilos do arquivo CSS Module
import styles from './login.module.css';

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
                // TENTA FAZER LOGIN
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Se deu certo, manda o peão pra arena principal!
                router.push("/");
            } else {
                // TENTA CADASTRAR NOVO JOGADOR
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                alert("Conta criada com sucesso! Entre na arena.");
                setIsLogin(true); // Muda pra tela de entrar
            }
        } catch (error: any) {
            setErrorMsg(error.message === "Invalid login credentials"
                ? "E-mail ou senha incorretos, parceiro."
                : error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* Container principal branco arredondado */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-indigo-100 w-full max-w-md">

                {/* Título e Subtítulo */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Bingo Helper</h1>
                    <p className="text-slate-400 font-medium uppercase text-xs tracking-widest mt-2">
                        {isLogin ? "Entre na Arena" : "Crie seu acesso"}
                    </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit}>
                    {/* 👉 PASSO 3.2: Container para os campos, usando a classe do CSS Module */}
                    <div className={styles.formFields}>
                        {/* Campo de E-mail */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="teste@peao.com"
                            // 👉 PASSO 3.3: Aplicar a classe CSS do input
                            className={styles.inputField}
                        />

                        {/* Campo de Senha */}
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Senha de 6 caracteres"
                            // 👉 PASSO 3.3: Aplicar a classe CSS do input
                            className={styles.inputField}
                        />
                    </div>

                    {/* Mensagem de Erro (se houver) */}
                    {errorMsg && (
                        <p className="text-red-500 text-sm font-bold text-center -mt-4 mb-4">
                            ⚠️ {errorMsg}
                        </p>
                    )}

                    {/* Botão de Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                        {loading ? "Aguarde..." : (isLogin ? "ENTRAR" : "CADASTRAR")}
                    </button>
                </form>

                {/* Link para alternar entre Login e Cadastro */}
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