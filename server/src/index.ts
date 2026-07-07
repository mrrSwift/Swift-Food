import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared";
import { poweredBy } from 'hono/powered-by'
import { logger } from 'hono/logger'


export const app = new Hono()

.use(cors())

.use(logger())
 
.use(poweredBy({serverName:"Swift"}))

.get("/", (c) => {
	return c.text("Hello Hono!");
})



.get("/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
});

export default app;