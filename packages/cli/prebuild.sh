#!/bin/bash
npm run unlink                                      # Unlink the local package, if it was previously linked
rm -rf dist                                         # Remove the dist folder, if it exists from a previous build
cd ../../app/prisma/ && npx --yes prisma generate   # Generate the prisma client using the schema from the main app folder, if it was not previously generated
                                                    # The CLI imports the generated client from the main app/ code -- the client and the schema are included in the the CLI build via ncc
