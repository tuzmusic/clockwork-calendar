import {Link, useLoaderData} from "@remix-run/react";

export default function () {
    const data = useLoaderData()
    console.log(data)
    return <>
        <h1>Other?</h1>
        <Link to={'/login'}>Login</Link>
    </>
}
