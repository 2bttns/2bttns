export default async function wait(delayMS: number) {
    return new Promise<void>((res) => {
        setTimeout(() => {
            res()
        }, delayMS)
    })
}
