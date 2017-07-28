VERSION=$1

echo "Building Tumblr Savior $VERSION"

cd src
zip ../Tumblr-Savior-$VERSION.zip ./* -r -9
cd ..

mkdir -p src.safariextension
cp -r src/* src.safariextension
./build-safari-extension.sh src.safariextension
rm -rf src.safariextension
mv src.safariextz Tumblr-Savior-$VERSION.safariextz
