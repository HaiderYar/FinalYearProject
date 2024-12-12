const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const CODE_DIR = path.join('C:', 'University', 'Semester 8', 'FYP', 'App', 'model');
const MONGO_URI = 'mongodb+srv://haider:haider1234@cluster0.o0guh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'testCaseRecords';
const COLLECTION_NAME = 'testCases';

// Ensure the code_files directory exists
if (!fs.existsSync(CODE_DIR)) {
    fs.mkdirSync(CODE_DIR);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.options('*', cors());

// MongoDB client setup
const client = new MongoClient(MONGO_URI);

async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}
connectToDB();

// API to generate test cases
app.post('/api/generate-test-cases', async (req, res) => {
    console.log('POST /api/generate-test-cases called');
    try {
        let code = req.body.code;
        const specialInstructions = req.body.specialInstructions || '';
        console.log('Received code from frontend:', code);
        console.log('Received special instructions from frontend:', specialInstructions);

        const codeFilePath = path.join(CODE_DIR, 'code.txt');
        const headerFilePath = path.join(CODE_DIR, 'code.h');
        const testFilePath = path.join(CODE_DIR, 'test.txt');
        const specialInstructionsFilePath = path.join(CODE_DIR, 'special_instructions.txt');

        // Remove the main() function from the code
        const mainFunctionRegex = /int\s+main\s*\([^)]*\)\s*\{[^}]*\}/g;
        code = code.replace(mainFunctionRegex, '');
        console.log('Code after removing main function:', code);

        // Save the code to files
        fs.writeFileSync(codeFilePath, code);
        fs.writeFileSync(headerFilePath, code);
        fs.writeFileSync(specialInstructionsFilePath, specialInstructions);
        console.log('Files saved successfully.');

        // Update test case generation stats in MongoDB
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        await collection.updateOne(
            { _id: "testCaseGenerationStats" },
            {
                $inc: { 
                    totalGenerationRequests: 1,
                    totalCodeSubmissions: 1 
                },
                $set: { 
                    lastRequestTimestamp: new Date(),
                    lastCodeLength: code.length
                },
                $setOnInsert: { 
                    firstRequestTimestamp: new Date()
                }
            },
            { upsert: true }
        );

        // Run the Python script to generate test cases
        exec(`python "${path.join(CODE_DIR, 'faizan.py')}"`, (error) => {
            if (error) {
                console.error('Error running Python script:', error.message);
                return res.status(500).json({ error: 'Internal server error' });
            }

            fs.readFile(testFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading test.txt:', err.message);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                const testBlocks = data.split('\n').filter(line => line.trim().startsWith('TEST'));
                const totalTestBlocks = testBlocks.length;

                const validationFilePath = path.join(CODE_DIR, 'validate_tests.cpp');
                const validationContent = `#include <gtest/gtest.h>\n#include "code.h"\n\n// Test cases from test.txt\n${data}`;

                fs.writeFileSync(validationFilePath, validationContent);
                console.log('Validation file created: validate_tests.cpp');

                res.json({ 
                    testCases: data.split('\n'),
                    totalTestBlocks: totalTestBlocks
                });
            });
        });
    } catch (error) {
        console.error('Error generating test cases:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to validate test cases
app.post('/api/validate-test-cases', (req, res) => {
    console.log('POST /api/validate-test-cases called');
    const validateFilePath = path.join(CODE_DIR, 'validate_tests.cpp');

    const compileCommand = `C:\\mingw64\\bin\\g++.exe -o "C:\\University\\Semester 8\\FYP\\App\\model\\validate_tests.exe" "${validateFilePath}" -std=c++14 -I"C:\\mingw64\\include" -L"C:\\mingw64\\lib" -lgtest -lgtest_main`;

    exec(compileCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('Error compiling validation script:', error.message);
            return res.status(500).json({ output: stdout, errors: stderr, error: 'Compilation failed' });
        }

        console.log('Compilation successful. Executing tests...');

        exec('"C:\\University\\Semester 8\\FYP\\App\\model\\validate_tests.exe"', async (runError, runStdout, runStderr) => {
            const terminalOutput = runStdout + runStderr;
        
            // Extract test results
            const passedTestCases = (terminalOutput.match(/OK/g) || []).length;
            const failedTestCases = (terminalOutput.match(/FAILED/g) || []).length;
            const currentTestCases = passedTestCases + failedTestCases;
        
            console.log('Updating test case stats in MongoDB...');
            const db = client.db(DB_NAME);
            const collection = db.collection(COLLECTION_NAME);
        
            // Increment total stats in "globalTestStats"
            try {
                await collection.updateOne(
                    { _id: "globalTestStats" },
                    {
                        $inc: { totalTestCases: currentTestCases, passedTestCases, failedTestCases },
                        $setOnInsert: { timestamp: new Date() } // Only set if the document is created
                    },
                    { upsert: true }
                );
                console.log('Global test stats updated successfully.');
            } catch (err) {
                console.error('Error updating global test stats:', err);
            }
        
            // Determine if a new week entry is needed
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
            try {
                const recentEntry = await collection.findOne({ timestamp: { $gte: oneWeekAgo } }, { sort: { timestamp: -1 } });
        
                if (recentEntry) {
                    // Update the recent entry if within the same week
                    await collection.updateOne(
                        { _id: recentEntry._id },
                        {
                            $inc: { recentTestCases: currentTestCases, recentPassed: passedTestCases, recentFailed: failedTestCases }
                        }
                    );
                    console.log('Recent weekly stats updated successfully.');
                } else {
                    // Create a new entry for a new week
                    const newEntry = {
                        recentTestCases: currentTestCases,
                        recentPassed: passedTestCases,
                        recentFailed: failedTestCases,
                        timestamp: new Date()
                    };
                    await collection.insertOne(newEntry);
                    console.log('New weekly stats entry created successfully.');
                }
            } catch (err) {
                console.error('Error updating recent weekly stats:', err);
            }
        
            // Respond to the frontend
            res.json({
                output: terminalOutput,
                currentTestCases,
                passedTestCases,
                failedTestCases,
                error: runError ? runError.message : null
            });
        });                  
    });
});



// API to fetch test case records
app.get('/api/dashboard', async (req, res) => {
    console.log('GET /api/dashboard called');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    try {
        const records = await collection.find().sort({ timestamp: -1 }).toArray();
        res.json(records);
    } catch (error) {
        console.error('Error fetching records from MongoDB:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});