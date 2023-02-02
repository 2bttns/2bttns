export default async function wait(delayS: number) {
    return new Promise<void>((res) => {
        setTimeout(() => {
            res()
        }, delayS * 1000)
    })
}
