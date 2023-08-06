
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import ABTesterComponent from "~/components/testtable";


export default function Home() {
    const router = useRouter();
    const { testid } = router.query;
    const testRes = api.example.getTest.useQuery({ id: testid as string });

    const testData = testRes.data?.test;

    if (!testData) return null;

    return (
        <>
            <div className="flex flex-col items-center justify-start min-h-screen h-full w-full">
                <ABTesterComponent testData={testData} />
            </div>
        </>
    );
}