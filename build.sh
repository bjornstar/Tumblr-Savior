VERSION=$1

echo "Building Tumblr Savior $VERSION"

cd src
zip ../Tumblr-Savior-$VERSION.zip ./* -r -9
cd ..

mv src src.safariextension
./build-safari-extension.sh src.safariextension
mv src.safariextension src

mv src.safariextz Tumblr-Savior-$VERSION.safarietz
