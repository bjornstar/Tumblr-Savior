VERSION=$1

echo "Building Tumblr Savior $VERSION"

cd src
zip ../Tumblr-Savior-$VERSION.zip ./* -r -9
cfx xpi --output-file ../Tumblr-Savior-$VERSION.xpi

cd ..

mv src src.safariextension
./build-safari-extension.sh src.safariextension
mv src.safariextension src

mv src.safariextz Tumblr-Savior-$VERSION.safariextz
