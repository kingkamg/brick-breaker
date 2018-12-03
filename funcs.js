/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const deleteFolderRecursive = (fpath) => {
  if (fs.existsSync(fpath)) {
    if (fs.statSync(fpath).isDirectory()) {
      fs.readdirSync(fpath).forEach((file, index) => {
        const curPath = path.join(fpath, file)
        if (fs.statSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath)
        } else { // delete file
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(fpath)
    } else {
      fs.unlinkSync(fpath)
    }
  }
}

const deleteFolderFilesRecursive = (fpath) => {
  if (fs.existsSync(fpath)) {
    if (fs.statSync(fpath).isDirectory()) {
      fs.readdirSync(fpath).forEach((file, index) => {
        const curPath = path.join(fpath, file)
        if (fs.statSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath)
        } else { // delete file
          fs.unlinkSync(curPath)
        }
      })
    } else {
      console.log(chalk.yellow('[skip]'), fpath, 'is not a dir')
    }
  } else {
    console.log(chalk.yellow('[skip]'), fpath, 'does not exist')
  }
}

const copyFileSync = (source, target) => {
  let targetFile = target
  // if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.statSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source))
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source))
}

const copyFolderRecursiveSync = (source, target) => {
  let files = []
  // check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source))
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder)
  }
  // copy
  if (fs.statSync(source).isDirectory()) {
    files = fs.readdirSync(source)
    files.forEach((file) => {
      const curSource = path.join(source, file)
      if (fs.statSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder)
      } else {
        copyFileSync(curSource, targetFolder)
      }
    })
  }
}

const copyFolderFilesRecursiveSync = (source, target) => {
  let files = []
  // check if folder needs to be created or integrated
  const targetFolder = path.join(target)
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder)
  }
  // copy
  if (fs.statSync(source).isDirectory()) {
    files = fs.readdirSync(source)
    files.forEach((file) => {
      const curSource = path.join(source, file)
      if (fs.statSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder)
      } else {
        copyFileSync(curSource, targetFolder)
      }
    })
  }
}

const getArgv = (argv, key, errmsg) => {
  let index = argv.indexOf(key)
  if (index === -1) {
    console.error(errmsg)
    return null
  }
  if (argv.length <= index + 1) {
    console.error(errmsg)
    return null
  }
  return argv[index + 1]
}

module.exports = {
  deleteFolderRecursive,
  deleteFolderFilesRecursive,
  copyFileSync,
  copyFolderRecursiveSync,
  copyFolderFilesRecursiveSync,
  getArgv
}
