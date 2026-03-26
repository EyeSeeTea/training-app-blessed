const fs = require("fs");
const path = require("path");

// Paths
const distPath = path.join(__dirname, "dist");
const jsFilePath = path.join(distPath, "index.js");
const dtsFilePath = path.join(distPath, "index.d.ts");
const modulePath = path.join(distPath, "tutorial-module", "index.js");
const srcPath = path.join(__dirname, "src");

// File contents
const jsContent = 'export * from "./tutorial-module/index";';
const dtsContent = 'export * from "./tutorial-module/index";';

function validateDistFolder() {
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath);
        console.log("'dist' directory created.");
    } else {
        console.log("'dist' directory already exists.");
    }
}

// Generate the files
function generateIndexJsWithTypes() {
    // Check if ./tutorial-module/index.js exists
    if (fs.existsSync(modulePath)) {
        console.log("The './tutorial-module/index.js' file exists. Generating files...");
        // Write index.js
        fs.writeFileSync(jsFilePath, jsContent);
        // Write index.d.ts
        fs.writeFileSync(dtsFilePath, dtsContent);
    } else {
        console.log("The './tutorial-module/index.js' file does not exist. Files will not be generated.");
    }
}

function updatePackageJson() {
    const packageJsonPath = path.join(__dirname, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const packageJson2 = { ...packageJson, name: packageJson.name.replace(/-app$/, "-component") };
    delete packageJson2["manifest.webapp"];
    moveToPeerDependencies(packageJson2);
    const destinationPath = path.join(distPath, "package.json");
    fs.writeFileSync(destinationPath, JSON.stringify(packageJson2, null, 2));
    console.log("package.json copied");
}

function moveToPeerDependencies(packageJson) {
    const depsToMove = [
        ["react-router", "react-router-dom", "react", "react-dom"],
        ["@material-ui/core", "@material-ui/icons", "@material-ui/lab", "@material-ui/styles"],
        [
            "@dhis2/app-runtime",
            "@dhis2/d2-i18n",
            "@dhis2/d2-i18n-extract",
            "@dhis2/d2-i18n-generate",
            "@dhis2/d2-ui-core",
            "@dhis2/d2-ui-forms",
            "@dhis2/ui",
        ],
        ["@eyeseetea/d2-ui-components"],
        ["purify-ts"],
        ["d2", "d2-manifest"],
    ].flat();
    depsToMove.forEach(dep => {
        if (packageJson.dependencies[dep]) {
            const depVersion = packageJson.dependencies[dep];
            packageJson.peerDependencies[dep] = depVersion.startsWith("^") ? depVersion : `^${depVersion}`;
            delete packageJson.dependencies[dep];
        } else {
            console.warn(`Dependency ${dep} not found in dependencies`);
        }
    });
    return packageJson;
}

function copyCssFiles() {
    const copyRecursive = (src, dest) => {
        if (fs.statSync(src).isDirectory()) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            fs.readdirSync(src).forEach(item => {
                copyRecursive(path.join(src, item), path.join(dest, item));
            });
        } else if (src.endsWith(".css")) {
            fs.copyFileSync(src, dest);
            console.log(`Copied CSS: ${src} -> ${dest}`);
        }
    };

    const tutorialModuleSrc = path.join(srcPath, "tutorial-module");
    const tutorialModuleDest = path.join(distPath, "tutorial-module");

    if (fs.existsSync(tutorialModuleSrc)) {
        copyRecursive(tutorialModuleSrc, tutorialModuleDest);
        console.log("CSS files copied successfully");
    }
}

function start() {
    updatePackageJson();
    validateDistFolder();
    generateIndexJsWithTypes();
    copyCssFiles();
}

start();
